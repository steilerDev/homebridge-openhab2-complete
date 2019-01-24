'use strict';

const Accessory = require('./NumericSensor');

class HumiditySensorAccessory extends Accessory {
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