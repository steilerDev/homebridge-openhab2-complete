'use strict';

const {Accessory} = require('../util/Accessory');
const {addBinarySensorCharacteristic} = require('./characteristic/BinarySensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class MotionSensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Motion Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating motion sensor service for ${this.name}`);
        let primaryService = new this.Service.MotionSensor(this.name);
        addBinarySensorCharacteristic.bind(this)(primaryService, this.Characteristic.MotionDetected);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "motion";

function createAccessory(platform, config) {
    return new MotionSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};
