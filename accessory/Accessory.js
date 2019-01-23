'use strict';

let getAccessoryInformationService = require('../util/Util').getAccessoryInformationService;

class Accessory {
    constructor(platform, config) {
        this._log = platform["log"];
        this._log.debug(`Creating new accessory: ${config.name}`);

        this._Characteristic = platform["api"].hap.Characteristic;
        this._Service = platform["api"].hap.Service;

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
        } else if(expectedItems.indexOf(type)) {
            throw new Error(`${habItem}'s type (${type}) is not as expected (${JSON.stringify(expectedItems)})`)
        } else {
            return type;
        }
    }

    _getAccessoryInformationService(modelDescription) {
        let Characteristic = this._Characteristic;
        let Service = this._Service;
        return new Service.AccessoryInformation()
            .setCharacteristic(Characteristic.Name, this.name)
            .setCharacteristic(Characteristic.Manufacturer, 'steilerDev')
            .setCharacteristic(Characteristic.Model, `openHAB2 ${modelDescription}`)
            .setCharacteristic(Characteristic.SerialNumber, this._config.serialNumber)
            .setCharacteristic(Characteristic.FirmwareRevision, this._config.version)
            .setCharacteristic(Characteristic.HardwareRevision, this._config.version);
    }
}

module.exports = Accessory;