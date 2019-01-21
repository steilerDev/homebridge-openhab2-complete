'use strict';

let Accessory, Characteristic, Service;
const HTTPHandler = require('../util/HTTPHandler');

class SwitchAccessory {

    constructor(api, log, config, host, port) {
        Accessory = api.hap.Accessory;
        Characteristic = api.hap.Characteristic;
        Service = api.hap.Service;

        this.log = log;
        this.name = config.name;

        log.info(`Creating new switch accessory: ${config.name}`);

        this.config = config;
        this.uuid_base = config.serialNumber;
        this._http = new HTTPHandler(host, port, log);

        if(!(config.habItem)) {
            throw new Error(`Required habItem not defined: ${util.inspect(acc)}`)
        }
        this._habItem = config.habItem;

        this._services = this.createServices();
    }

    getServices() {
        this.log.debug("Getting services");
        return this._services;
    }

    createServices() {
        this.log.debug("Creating services");
        return [
            this.getAccessoryInformationService(),
            this.getSwitchService()
        ];
    }

    getAccessoryInformationService() {
        return new Service.AccessoryInformation()
            .setCharacteristic(Characteristic.Name, this.name)
            .setCharacteristic(Characteristic.Manufacturer, 'steilerDev')
            .setCharacteristic(Characteristic.Model, 'Switch')
            .setCharacteristic(Characteristic.SerialNumber, this.config.serialNumber)
            .setCharacteristic(Characteristic.FirmwareRevision, this.config.version)
            .setCharacteristic(Characteristic.HardwareRevision, this.config.version);
    }

    getSwitchService() {
        this.log.debug(`Creating switch service for ${this.name} aka as openHAB item ${this._habItem}`);
        this._switchService = new Service.Switch(this.name);
        this._switchService.getCharacteristic(Characteristic.On)
            .on('set', this._setState.bind(this, this.name, this._habItem))
            .on('get', this._getState.bind(this, this.name, this._habItem));

        return this._switchService;
    }

    identify(callback) {
        this.log.debug(`Identify request received!`);
        callback();
    }

    _setState(name, habItem, value, callback) {
        this.log.debug(`Change target state of ${name} (aka as openHAB item ${habItem}) to ${value}`);

        var command;

        if(value === true) {
            command = "ON";
        } else if (value === false) {
            command = "OFF";
        } else {
            throw new Error(`Unable to set state for target value ${value}`);
        }

        this._http.sendCommand(habItem, command, function (error, response, body) {
            if (error) {
                this.log.error(`HTTP send command function failed: ${error.message}`);
                callback(error);
            } else {
                this.log.debug(`Changed target state of ${name}`);
                callback();
            }
        }.bind(this));
    }

    _getState(name, habItem, callback) {
        this.log.debug(`Getting state for ${name} aka as openHAB item ${habItem}`);
        this._http.getState(habItem, function (error, response, body) {
            if (error) {
                this.log.error(`HTTP get state function failed: ${error.message}`);
                callback(error);
            } else {
                this.log.debug(`Received response: ${body}`);
                if(body === "ON") {
                    callback(null, true);
                } else if (body === "OFF") {
                    callback(null, false);
                } else {
                    callback(null, undefined);
                }
            }
        }.bind(this));
    }




}

module.exports = SwitchAccessory;