'use strict';

let PLATFORM = {
    log: "log",
    api: "api",
    hap: "hap",
    openHAB: "openHAB"
};

class Accessory {
    constructor(platform, config) {
        this._log = platform[PLATFORM.log];
        this._log.debug(`Creating new accessory: ${config.name}`);

        this.Characteristic = platform[PLATFORM.api][PLATFORM.hap].Characteristic;
        this.Service = platform[PLATFORM.api][PLATFORM.hap].Service;

        this._config = config;
        this._openHAB = platform[PLATFORM.openHAB];
        this.name = config.name;
        this.uuid_base = config.serialNumber;

        this._services = [];

    }

    // Called by homebridge
    identify(callback) {
        this._log.debug(`Identify request received!`);
        callback();
    }

    // Called by homebridge
    getServices() {
        this._log.debug("Getting services");
        return this._services;
    }

    _subscribeCharacteristic(service, characteristic, item, transformation) {
        this._log.debug(`Subscribing to changes for ${item}`);
        this._openHAB.subscribe(item, function(value, habItem) {
            if(value instanceof Error) {
                this._log.error(`Error subscribing for ${item}: ${value.message}`);
            } else {
                this._log(`Received push with new state for item ${habItem}: ${value}`);
                let transformedValue = transformValue(transformation, value);
                if(transformedValue !== null) {
                    service.setCharacteristic(characteristic, transformedValue);
                }
            }
        }.bind(this));
    }

    _getAndCheckItemType(key, expectedItems, optional) {
        if(!(this._config[key])) {
            if(optional) {
                this._log.debug(`${key} for ${this.name} not defined in config: ${JSON.stringify(this._config)})`)
            } else {
                throw new Error(`Required ${key} for ${this.name} not defined: ${JSON.stringify(this._config)}`)
            }
        } else {
            let item = this._config[key];
            let type = this._openHAB.getItemType(item);
            if (type instanceof Error) {
                if(optional) {
                    this._log.debug(`Not adding ${key} to ${this.name}: ${type.message}`);
                } else {
                    throw type;
                }
            } else if (expectedItems.indexOf(type) === -1) {
                if(optional) {
                    this._log.debug(`Not adding ${key} to ${this.name}: ${item}'s type (${type}) is not as expected (${JSON.stringify(expectedItems)})`)
                } else {
                    throw new Error(`${item}'s type (${type}) is not as expected (${JSON.stringify(expectedItems)})`)
                }
            } else {
                return [item, type];
            }
        }
        return [null, null];
    }

    _checkInvertedConf(key) {
        if(this._config[key] && (this._config[key] === "false" || this._config[key] === "true")) {
            return this._config[key] === "true";
        } else {
            return false;
        }
    }

    _checkMultiplierConf(key, itemType) {
        if(itemType === 'Number' || itemType === 'Rollershutter') {
            if(this._config[key]) {
                let parsedValue = parseFloat(this._config[key]);
                if (!isNaN(parsedValue)) {
                    return parsedValue;
                } else {
                    this._log.debug(`Not parsing multiplier for ${this.name}, because value (${this._config[key]}) is not parsable as float: Result ${parsedValue})`);
                }
            } else {
                this._log.debug(`Not parsing multiplier for ${this.name}, because ${key} is not defined in config: ${JSON.stringify(this._config)}`);
            }
        } else {
            this._log.debug(`Not parsing multiplier for ${this.name}, because of item's type ${itemType}`);
        }
        return 1;
    }

    _getAccessoryInformationService(modelDescription) {
        return new this.Service.AccessoryInformation()
            .setCharacteristic(this.Characteristic.Name, this.name)
            .setCharacteristic(this.Characteristic.Manufacturer, 'steilerDev')
            .setCharacteristic(this.Characteristic.Model, `openHAB2 ${modelDescription}`)
            .setCharacteristic(this.Characteristic.SerialNumber, this.uuid_base)
            .setCharacteristic(this.Characteristic.FirmwareRevision, this._config.version)
            .setCharacteristic(this.Characteristic.HardwareRevision, this._config.version);
    }
}

// transformation may be 'undefined', a map or a function [in case of a function the return value needs to be either a valid value or an Error()
function transformValue(transformation, value) {
    if (transformation === null || transformation === undefined) {
        return value;
    } else if (typeof (transformation) === "function") {
        return transformation(value);
    } else if (typeof (transformation) === "object") {
        if (transformation[value] !== undefined) {
            return transformation[value];
        } else if (transformation["_default"] !== undefined) {
            return transformation["_default"];
        } else {
            return new Error(`Unable to transform ${value} using transformation map ${JSON.stringify(transformation)}`);
        }
    }
}

function getState(habItem, transformation, callback) {
    this._log.debug(`Getting state for ${this.name} [${habItem}]`);
    this._openHAB.getState(habItem, function(error, state) {
        if(error) {
            this._log.error(`Unable to get state for ${this.name} [${habItem}]: ${error.message}`);
            if(callback && typeof callback === "function") {
                callback(error);
            }
        } else {
            let transformedState = transformValue(transformation, state);
            this._log(`Received state: ${state} (transformed to ${transformedState}) for ${this.name} [${habItem}]`);
            if(transformedState instanceof Error) {
                this._log.error(transformedState.message);
                if(callback && typeof callback === "function") {
                    callback(transformedState);
                }
            } else {
                if(callback && typeof callback === "function") {
                    callback(null, transformedState);
                }
            }
        }
    }.bind(this));
}

function setState(habItem, transformation, state, callback, context, connectionID) {
    let transformedState = transformValue(transformation, state);
    this._log.debug(`Change target state of ${this.name} [${habItem}] to ${state} (transformed to ${transformedState})`);
    this._log.error(`Context: ${JSON.stringify(context)}`);
    this._log.error(`Connection ID: ${JSON.stringify(connectionID)}`);
    if(transformedState instanceof Error) {
        this._log.error(transformedState.message);
        if(callback && typeof callback === "function") {
            callback(transformedState);
        }
    } else {
        this._openHAB.sendCommand(habItem, `${transformedState}`, function (error) {
            if (error) {
                this._log.error(`Unable to send command: ${error.message}`);
                if(callback && typeof callback === "function") {
                    callback(error);
                }
            } else {
                this._log(`Changed target state of ${this.name} [${habItem}] to ${transformedState}`);
                if(callback && typeof callback === "function") {
                    callback();
                }
            }
        }.bind(this));
    }
}

module.exports = {Accessory, getState, setState};
