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

    // Put the response of openHAB.getItemType in here, handles errors of the function
    _getAndCheckItemType(habItem, expectedItems) {
        let type = this._openHAB.getItemType(habItem);
        if (type instanceof Error) {
            throw type;
        } else if (expectedItems.indexOf(type) === -1) {
            throw new Error(`${habItem}'s type (${type}) is not as expected (${JSON.stringify(expectedItems)})`)
        } else {
            return type;
        }
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
            return new Error(`Unable to transform ${state} using transformation map ${JSON.stringify(transformation)}`);
        }
    }

}

function getState(habItem, transformation, callback) {
    this._log(`Getting state for ${this.name} [${habItem}]`);
    this._openHAB.getState(habItem, function(error, state) {
        if(error) {
            this._log.error(`Unable to get state for ${this.name} [${habItem}]: ${error.message}`);
            callback(error);
        } else {
            this._log(`Received state: ${state} for ${this.name} [${habItem}]`);
            let transformedState = transformValue(transformation, state);
            if(transformedState instanceof Error) {
                this._log.error(transformedState.message);
                callback(transformedState);
            } else {
                callback(null, transformedState);
            }
        }
    }.bind(this));
}

function setState(habItem, transformation, state, callback) {
    this._log(`Change target state of ${this.name} [${this._habItem}] to ${state}`);
    let transformedState = transformValue(transformation, state);
    if(transformedState instanceof Error) {
        this._log.error(transformedState.message);
        callback(transformedState);
    } else {
        this._openHAB.sendCommand(habItem, transformedState, function (error) {
            if (error) {
                this._log.error(`Unable to send command: ${error.message}`);
                callback(error);
            } else {
                this._log.debug(`Changed target state of ${this.name} [${habItem}] to ${transformedState}`);
                callback();
            }
        }.bind(this));
    }
}

module.exports = {Accessory, getState, setState};
