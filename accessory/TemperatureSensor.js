'use strict';

const NumericSensorAccessory = require('./NumericSensor');

class TemperatureSensorAccessory extends NumericSensorAccessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Temperature Sensor'),
            this._configureNumericService(
                new this.Service.TemperatureSensor(this.name),
                this.Characteristic.CurrentTemperature
            )
        ]
    }
}

module.exports = TemperatureSensorAccessory;