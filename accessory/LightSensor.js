'use strict';

const {Accessory} = require('../util/Accessory');
const {addCurrentAmbientLightLevelCharacteristic} = require('./characteristic/Numeric');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class LightSensorAccessory extends Accessory {
    _getPrimaryService() {
        this._log.debug(`Creating light sensor service for ${this.name}`);
        let primaryService = new this.Service.LightSensor(this.name);
        addCurrentAmbientLightLevelCharacteristic.bind(this)(primaryService);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "lux";

function createAccessory(platform, config) {
    return new LightSensorAccessory(platform, config, 'Light Sensor');
}

module.exports = {createAccessory, type};

