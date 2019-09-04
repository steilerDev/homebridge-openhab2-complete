'use strict';

const {Accessory} = require('../util/Accessory');
const {addMotionDetectedCharacteristic} = require('./characteristic/Binary');
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
        addMotionDetectedCharacteristic.bind(this)(primaryService);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "motion";

function createAccessory(platform, config) {
    return new MotionSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};
