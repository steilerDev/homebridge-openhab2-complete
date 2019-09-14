'use strict';

const {Accessory} = require('../util/Accessory');
const {addAtmosphericPressureLevel} = require('./characteristic/Numeric');

class AtmosphericPressureSensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);
        this._services.unshift(this._getAccessoryInformationService('Atmospheric Pressure Sensor'));
        this._services.push(this._getPrimaryService());
    }

    _getPrimaryService() {
        this._log.debug(`Creating atmospheric pressure sensor service for ${this.name}`);
        let primaryService = new this.Community.AtmosphericPressureSensor(this.name);
        addAtmosphericPressureLevel.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "atmospheric";

function createAccessory(platform, config) {
    return new AtmosphericPressureSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};

