'use strict';

const {Accessory} = require('../util/Accessory');
const {addCurrentTemperatureCharacteristic} = require('./characteristic/Climate');

class TemperatureSensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);
        this._services.unshift(this._getAccessoryInformationService('Temperature Sensor'));
        this._services.push(this._getPrimaryService());
    }

    _getPrimaryService() {
        this._log.debug(`Creating temperature sensor service for ${this.name}`);
        let primaryService = new this.Service.TemperatureSensor(this.name);
        addCurrentTemperatureCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "temp";

function createAccessory(platform, config) {
    return new TemperatureSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};

