'use strict';

const {Accessory} = require('../util/Accessory');
const {addMotionDetectedCharacteristic} = require('./characteristic/BinarySensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class MotionSensorAccessory extends Accessory {
    _getPrimaryService() {
        this._log.debug(`Creating motion sensor service for ${this.name}`);
        let primaryService = new this.Service.MotionSensor(this.name);
        addMotionDetectedCharacteristic.bind(this)(primaryService);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "motion";

function createAccessory(platform, config) {
    return new MotionSensorAccessory(platform, config, 'Motion Sensor');
}

module.exports = {createAccessory, type};
