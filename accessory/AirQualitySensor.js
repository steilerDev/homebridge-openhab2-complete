'use strict';

const {Accessory}  = require('../util/Accessory');
const {addAirQualityCharacteristic} = require('./characteristic/Numeric');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class AirQualitySensorAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);
        this._services.push([
            this._getAccessoryInformationService('Air Quality Sensor'),
            this._getPrimaryService()
        ]);
    }

    _getPrimaryService() {
        this._log.debug(`Creating air quality sensor service for ${this.name}`);
        let primaryService = new this.Service.AirQuality(this.name);
        addAirQualityCharacteristic.bind(this)(primaryService);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "air";

function createAccessory(platform, config) {
    return new AirQualitySensorAccessory(platform, config);
}

module.exports = {createAccessory, type};

