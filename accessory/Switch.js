'use strict';

let Accessory, Characteristic, Service;
const HTTPHandler = require('../util/HTTPHandler');

class SwitchAccessory {

    constructor(api, log, config, host, port) {
        Accessory = api.hap.Accessory;
        Characteristic = api.hap.Characteristic;
        Service = api.hap.Service;

        this._log = log;
        this._name = config.name;
        this._config = config;
        this._http = new HTTPHandler(host, port, log);

        this._state = this._getState();

        this._services = this.createServices();
    }

    getServices() {
        return this._services;
    }

    createServices() {
        return [
            this.getAccessoryInformationService(),
            this.getBridgingStateService(),
            this.getSwitchService()
        ];
    }

    getAccessoryInformationService() {
        return new Service.AccessoryInformation()
            .setCharacteristic(Characteristic.Name, this.name)
            .setCharacteristic(Characteristic.Manufacturer, 'steilerDev')
            .setCharacteristic(Characteristic.Model, 'Switch')
            .setCharacteristic(Characteristic.SerialNumber, this._config.serialNumber)
            .setCharacteristic(Characteristic.FirmwareRevision, this._config.version)
            .setCharacteristic(Characteristic.HardwareRevision, this._config.version);
    }

    getBridgingStateService() {
        return new Service.BridgingState()
            .setCharacteristic(Characteristic.Reachable, true)
            .setCharacteristic(Characteristic.LinkQuality, 4)
            .setCharacteristic(Characteristic.AccessoryIdentifier, this.name)
            .setCharacteristic(Characteristic.Category, Accessory.Categories.SWITCH);
    }

    getSwitchService() {
        this._switchService = new Service.Switch(this._name);
        this._switchService.getCharacteristic(Characteristic.On)
            .on('set', this._setState.bind(this))
            .on('get', this._getState.bind(this));

        this._switchService.isPrimaryService = true;

        return this._switchService;
    }

    identify(callback) {
        this._log(`Identify requested on ${this._name}`);
        callback();
    }

    _setState(value, callback) {
        this._log(`Change target state of ${this._name} to ${value}`);


        // Request

        data.state = value;
        callback();
    }

    _getState(callback) {
        this._log(`Getting state for ${this._name}`);
        this._http.getRequest(this._config.habItem, function (error, response, body) {
            this._
        })
    }
}

module.exports = SwitchAccessory;