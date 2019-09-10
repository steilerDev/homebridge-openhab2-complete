'use strict';

const {Accessory} = require('../util/Accessory');
const {addCurrentAmbientLightLevelCharacteristic} = require('./characteristic/Numeric');

class LightSensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);
        this._services.unshift(this._getAccessoryInformationService('Light Sensor'));
        this._services.push(this._getPrimaryService());
    }

    _getPrimaryService() {
        this._log.debug(`Creating light sensor service for ${this.name}`);
        let primaryService = new this.Service.LightSensor(this.name);
        addCurrentAmbientLightLevelCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "lux";

function createAccessory(platform, config) {
    return new LightSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};

