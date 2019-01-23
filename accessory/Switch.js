'use strict';

let Characteristic, Service;

let getAccessoryInformationService = require('util/Util').getAccessoryInformationService;

class SwitchAccessory {
    constructor(platform, config) {
        this._log = platform["log"];
        this._log.debug(`Creating new switch accessory: ${config.name}`);

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
        } else if(this._type !== "Switch") {
            throw new Error(`${this._habItem}'s type (${this._type}) is not as expected ('Switch')`)
        }

        this._services = [
            getAccessoryInformationService(platform, config, 'openHAB 2 Switch'),
            this._getSwitchService()
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

    _getSwitchService() {
        this._log.debug(`Creating switch service for ${this.name}/${this._habItem}`);
        this._switchService = new Service.Switch(this.name);
        this._switchService.getCharacteristic(Characteristic.On)
            .on('set', this._setState.bind(this))
            .on('get', this._getState.bind(this));

        return this._switchService;
    }

    _setState(value, callback) {
        this._log(`Change target state of ${this.name} [${this._habItem}] to ${value}`);

        let command;
        if(value === true) {
            command = "ON";
        } else if (value === false) {
            command = "OFF";
        } else {
            this._log.error(`Unable to set state for target value ${value}`);
        }

        this._openHAB.sendCommand(this._habItem, command, function(error) {
            if(error) {
                this._log.error(`Unable to send command: ${error.message}`);
                callback(error);
            } else {
                this._log.debug(`Changed target state of ${this.name}`);
                callback();
            }
        }.bind(this));
    }

    _getState(callback) {
        this._log(`Getting state for ${this.name} [${this._habItem}]`);
        this._openHAB.getState(this._habItem, function(error, state) {
            if(error) {
                this._log.error(`Unable to get state: ${error.message}`);
                callback(error);
            } else {
                this._log(`Received state: ${state} for ${this.name} [${this._habItem}`);
                if(state === "ON") {
                    callback(null, true);
                } else if (state === "OFF") {
                    callback(null, false);
                } else {
                    callback(null, undefined);
                }
            }
        }.bind(this));
    }
}

module.exports = SwitchAccessory;