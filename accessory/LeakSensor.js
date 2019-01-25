'use strict';

const {BinarySensorAccessory} = require('./BinarySensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class LeakSensorAccessory extends BinarySensorAccessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Leak Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        let primaryService = this._configureBinaryService(
            new this.Service.LeakSensor(this.name),
            this.Characteristic.LeakDetected
        );

        addBatteryWarningCharacteristic.bind(this)(primaryService);

        return primaryService;
    }
}

function createLeakSensorAccessory(platform, config) {
    return new LeakSensorAccessory(platform, config);
}

module.exports = {createLeakSensorAccessory};
