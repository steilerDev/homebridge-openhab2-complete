'use strict';

const {NumericSensorAccessory} = require('./NumericSensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class LightSensorAccessory extends NumericSensorAccessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Light Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        let primaryService = this._configureNumericService(
            new this.Service.LightSensor(this.name),
            this.Characteristic.CurrentAmbientLightLevel
        );

        addBatteryWarningCharacteristic.bind(this)(primaryService);

        return primaryService;
    }
}

const type = "light";

function createAccessory(platform, config) {
    return new LightSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};

