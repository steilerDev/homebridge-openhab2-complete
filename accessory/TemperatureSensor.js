'use strict';

let Characteristic, Service;

let getAccessoryInformationService = require('../util/Util').getAccessoryInformationService;

class TemperatureSensorAccessory {
    constructor(platform, config) {
        this._log = platform["log"];
        this._log.debug(`Creating new temperatur sensor accessory: ${config.name}`);

        Characteristic = platform["api"].hap.Characteristic;
        Service = platform["api"].hap.Service;

        this._config = config;
        this._openHAB = platform["openHAB"];
        this.name = config.name;
        this.uuid_base = config.serialNumber;

        if(!(this._config.habItem)) {
            throw new Error(`Required habItem not defined: ${JSON.stringify(acc)}`)
        } else {
            this._habItem = config.habItem;
        }

        this._type = this._openHAB.getItemType(this._habItem);
        if(this._type instanceof Error) {
            throw this._type;
        } else if(this._type !== "Number") {
            throw new Error(`${this._habItem}'s type (${this._type}) is not as expected ('Number')`)
        }

        this._services = [
            getAccessoryInformationService(platform, config, 'Temperature Sensor'),
            this._getTempService()
        ]
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

    _getTempService() {
        this._log.debug(`Creating temp service for ${this.name}/${this._habItem}`);
        this._tempService = new Service.TemperatureSensor(this.name);
        this._tempService.getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', this._getState.bind(this));

        return this._tempService;
    }

    _getState(callback) {
        this._log(`Getting state for ${this.name} [${this._habItem}]`);
        this._openHAB.getState(this._habItem, function(error, state) {
            if(error) {
                this._log.error(`Unable to get state: ${error.message}`);
                callback(error);
            } else {
                this._log(`Received state: ${state} for ${this.name} [${this._habItem}]`);
                callback(null, state);
            }
        }.bind(this));
    }
}

module.exports = TemperatureSensorAccessory;