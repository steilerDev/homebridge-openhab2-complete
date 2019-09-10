'use strict';

const {Accessory} = require('../util/Accessory');
const {addCurrentTemperatureCharacteristic} = require('./characteristic/Climate');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class TemperatureSensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Temperature Sensor'),
           // this._tryBatteryService.bind(this)(),
            this._getPrimaryService()
        ]
    }

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
    return new TemperatureSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};

