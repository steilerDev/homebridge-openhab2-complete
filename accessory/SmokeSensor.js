'use strict';

const {BinarySensorAccessory} = require('./BinarySensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class SmokeSensorAccessory extends BinarySensorAccessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Smoke Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        let primaryService = this._configureBinaryService(
            new this.Service.SmokeSensor(this.name),
            this.Characteristic.SmokeDetected
        );

        addBatteryWarningCharacteristic.bind(this)(primaryService);

        return primaryService;
    }
}

const type = "smoke";

function createAccessory(platform, config) {
    return new SmokeSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};
