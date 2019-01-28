'use strict';

const {Accessory} = require('../util/Accessory');
const {addNumericSensorCharacteristic} = require('./characteristic/NumericSensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class LightSensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Light Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating humidity sensor service for ${this.name}`);
        let primaryService = new this.Service.LightSensor(this.name);
        addNumericSensorCharacteristic.bind(this)(primaryService, this.Characteristic.CurrentAmbientLightLevel);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "lightSensor";

function createAccessory(platform, config) {
    return new LightSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};

