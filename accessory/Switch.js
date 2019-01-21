'use strict';

let Accessory, Characteristic, Service;
const HTTPHandler = require('../util/HTTPHandler');

class SwitchAccessory {

    constructor(api, log, config, host, port) {
        log(`Creating new switch accessory: ${config.name}`);
        Accessory = api.hap.Accessory;
        Characteristic = api.hap.Characteristic;
        Service = api.hap.Service;

        this.log = log;
        this.name = config.name;
        this.config = config;
        this.uuid_base = config.serialNumber || "123";
        this._habItem = config.habItem;
        this._http = new HTTPHandler(host, port, log);
        this._state = true;

        this._services = this.createServices();
    }

    getServices() {
        this.log("Getting services");
        return this._services;
    }

    createServices() {
        this.log("Creating services");
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

    getBridgingStateService() {
        return new Service.BridgingState()
            .setCharacteristic(Characteristic.Reachable, true)
            .setCharacteristic(Characteristic.LinkQuality, 4)
            .setCharacteristic(Characteristic.AccessoryIdentifier, this.name)
            .setCharacteristic(Characteristic.Category, Accessory.Categories.SWITCH);
    }

    getSwitchService() {
        this.log(`Creating switch service for ${this.name} aka as openHAB item ${this._habItem}`);
        this._switchService = new Service.Switch(this.name);
        this._switchService.getCharacteristic(Characteristic.On)
            .on('set', this._setState.bind(this, this.name, this._habItem))
            .on('get', this._getState.bind(this, this.name, this._habItem));

        //this._switchService.isPrimaryService = true;

        return this._switchService;
    }

    identify(callback) {
        this.log(`Identify requested on ${this._name}`);
        callback();
    }

    _setState(name, habItem, value, callback) {
        this.log(`Change target state of ${name} (aka as openHAB item ${habItem}) to ${value}`);

        // Request
        this.log(`Changed target state of ${this._name}`);

        callback();
    }

    _getState(name, habItem, callback) {
        this.log(`Getting state for ${name} aka as openHAB item ${habItem}`);
        this._http.getRequest(habItem, function (error, response, body) {
            if (error) {
                this.log(`HTTP get power function failed: ${error.message}`);
                callback(error);
            } else {
                this.log(`Received response: ${body}`);
                if(body === "ON") {
                    //this._state = true;
                    callback(null, true);
                } else if (body === "OFF") {
                    //this._state = false;
                    callback(null, false);
                } else {
                    //this._state = undefined;
                    callback(null, undefined);
                }
                //callback(null, this._state);
            }
        }.bind(this));
    }




}

module.exports = SwitchAccessory;