'use strict';

const NumericSensorAccessory = require('./NumericSensor');

class HumiditySensorAccessory extends NumericSensorAccessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Humidity Sensor'),
            this._configureNumericService(
                new this.Service.HumiditySensor(this.name),
                this.Characteristic.CurrentRelativeHumidity
            )
        ]
    }
}

module.exports = HumiditySensorAccessory;