'use strict';

const {BinarySensorAccessory} = require('./BinarySensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class MotionSensorAccessory extends BinarySensorAccessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Motion Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.error(`Getting primary service for ${this.name}: ${JSON.stringify(this)}`);
        let primaryService = this._configureBinaryService(
            new this.Service.MotionSensor(this.name),
            this.Characteristic.Characteristic.MotionDetected
        );

        addBatteryWarningCharacteristic(this, primaryService);

        return primaryService;
    }
}

module.exports = {MotionSensorAccessory};
