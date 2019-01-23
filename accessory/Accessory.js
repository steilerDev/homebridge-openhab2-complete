'use strict';

class Accessory {
    constructor(platform, config) {
        this._log = platform["log"];
        this._log.debug(`Creating new accessory: ${config.name}`);

        this.Characteristic = platform["api"]["hap"].Characteristic;
        this.Service = platform["api"]["hap"].Service;

        this._config = config;
        this._openHAB = platform["openHAB"];
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
        if(type instanceof Error) {
            throw type;
        } else if(expectedItems.indexOf(type) === -1) {
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
            .setCharacteristic(this.Characteristic.SerialNumber, this._config.serialNumber)
            .setCharacteristic(this.Characteristic.FirmwareRevision, this._config.version)
            .setCharacteristic(this.Characteristic.HardwareRevision, this._config.version);
    }
}

module.exports = Accessory;
