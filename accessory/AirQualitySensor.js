'use strict';

const {Accessory}  = require('../util/Accessory');
const {addAirQualityCharacteristic} = require('./characteristic/Numeric');

class AirQualitySensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);
        this._services.unshift(this._getAccessoryInformationService('Air Quality Sensor'));
        this._services.push(this._getPrimaryService());
    }

    _getPrimaryService() {
        this._log.debug(`Creating air quality sensor service for ${this.name}`);
        let primaryService = new this.Service.AirQualitySensor(this.name);
        addAirQualityCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "air";

function createAccessory(platform, config) {
    return new AirQualitySensorAccessory(platform, config);
}

module.exports = {createAccessory, type};

