'use strict';

const {batteryService} = require('../accessory/characteristic/Battery');

let PLATFORM = {
    log: "log",
    api: "api",
    hap: "hap",
    openHAB: "openHAB"
};

class Accessory {
    constructor(platform, config, modelDescription) {
        this._log = platform[PLATFORM.log];
        this._log.debug(`Creating new ${modelDescription} accessory: ${config.name}`);

        this.Characteristic = platform[PLATFORM.api][PLATFORM.hap].Characteristic;
        this.Service = platform[PLATFORM.api][PLATFORM.hap].Service;

        this._config = config;
        this._openHAB = platform[PLATFORM.openHAB];
        this.name = config.name;
        this.uuid_base = config.serialNumber;

        this._services = [];

        this._services.push(this._getAccessoryInformationService(modelDescription));

        let thisBatteryService = batteryService.bind(this)();
        if(thisBatteryService !== null) {
            this._services.push(thisBatteryService);
        }
        this._services.push(this._getPrimaryService());
    }

    // Called by homebridge
    identify(callback) {
        this._log.debug(`Identify request received!`);
        callback();
    }

    // Called by homebridge
    getServices() {
        this._log.debug(`Getting services for ${this.name} (${this._services.length} service(s) registered for this accessory`);
        return this._services;
    }

    _getPrimaryService() {
        let msg = `Base class does not provide a binary service!`
        this._log.error(msg);
        throw new Error(msg);
    }

    _subscribeCharacteristic(characteristic, item, transformation, callback) {
        this._log.debug(`Subscribing to changes for ${item}`);
        this._openHAB.subscribe(item, function(value, habItem) {
            if(value instanceof Error) {
                this._log.error(`Error subscribing for ${item}: ${value.message}`);
            } else {
                this._log(`Received push with new state for item ${habItem}: ${value}`);
                let transformedValue = transformValue(transformation, value);
                if(transformedValue !== null) {
                    // Setting value for the stored characteristic, but not executing it agains openHAB
                    characteristic.setValue(transformedValue, null, "openHABIgnore");
                    if(callback && typeof(callback) === "function") {
                        callback(transformedValue);
                    }
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
            if (!type || type instanceof Error) {
                if(optional) {
                    this._log.debug(`Not adding ${key} to ${this.name}: ${type ? type.message : 'Item type was not synced initially and is therefore not available'}`);
                } else {
                    throw type ? type : new Error('Item type was not synced initially and is therefore not available');
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

// context and connectionID are variables giving information about the origin of the request. If a setValue/setCharacteristic is called, we are able to manipulate those.
// If context is set to 'openHABIgnore' the actual set state will not be executed towards openHAB
function setState(habItem, transformation, state, callback, context, connectionID) {
    let transformedState = transformValue(transformation, state);
    this._log.debug(`Change target state of ${this.name} [${habItem}] to ${state} (transformed to ${transformedState}) [Context: ${context ? JSON.stringify(context): 'Not defined'}, ConnectionID: ${connectionID}`);
    if(context === "openHABIgnore") {
        callback();
    } else {
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
}

function dummyTransformation(itemType, inverted, value) {
    return value;
}

module.exports = {Accessory, getState, setState, dummyTransformation};
