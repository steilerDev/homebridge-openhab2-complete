'use strict';

const {Accessory} = require('../util/Accessory');
const {addCurrentTemperatureCharacteristic} = require('./characteristic/Numeric');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class TemperatureSensorAccessory extends Accessory {
    _getPrimaryService() {
        this._log.debug(`Creating temperature sensor service for ${this.name}`);
        let primaryService = new this.Service.TemperatureSensor(this.name);
        addCurrentTemperatureCharacteristic.bind(this)(primaryService);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "temp";

function createAccessory(platform, config) {
    return new TemperatureSensorAccessory(platform, config, 'Temperature Sensor');
}

module.exports = {createAccessory, type};

