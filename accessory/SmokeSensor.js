'use strict';

const {Accessory} = require('../util/Accessory');
const {addSmokeDetectedCharacteristic} = require('./characteristic/BinarySensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class SmokeSensorAccessory extends Accessory {
    _getPrimaryService() {
        this._log.debug(`Creating occupancy sensor service for ${this.name}`);
        let primaryService = new this.Service.SmokeSensor(this.name);
        addSmokeDetectedCharacteristic.bind(this)(primaryService);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "smoke";

function createAccessory(platform, config) {
    return new SmokeSensorAccessory(platform, config, 'Smoke Sensor');
}

module.exports = {createAccessory, type};
