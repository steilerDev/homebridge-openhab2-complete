'use strict';

const {Accessory}  = require('../util/Accessory');
const {addNumericSensorCharacteristic} = require('./characteristic/NumericSensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class HumiditySensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Humidity Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating humidity sensor service for ${this.name}`);
        let primaryService = new this.Service.HumiditySensor(this.name);
        addNumericSensorCharacteristic.bind(this)(primaryService, this.Characteristic.CurrentRelativeHumidity);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "humidity";

function createAccessory(platform, config) {
    return new HumiditySensorAccessory(platform, config);
}

module.exports = {createAccessory, type};

