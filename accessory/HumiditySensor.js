'use strict';

const {NumericSensorAccessory} = require('./NumericSensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class HumiditySensorAccessory extends NumericSensorAccessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Humidity Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        let primaryService = this._configureNumericService(
            new this.Service.HumiditySensor(this.name),
            this.Characteristic.CurrentRelativeHumidity
        );

        addBatteryWarningCharacteristic.bind(this)(primaryService);

        return primaryService;
    }
}

module.exports = {HumiditySensorAccessory};
