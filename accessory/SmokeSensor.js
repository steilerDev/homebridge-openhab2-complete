'use strict';

const {Accessory} = require('../util/Accessory');
const {addSmokeDetectedCharacteristic} = require('./characteristic/Binary');

class SmokeSensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);
        this._services.unshift(this._getAccessoryInformationService('Smoke Sensor'));
        this._services.push(this._getPrimaryService());
    }

    _getPrimaryService() {
        this._log.debug(`Creating occupancy sensor service for ${this.name}`);
        let primaryService = new this.Service.SmokeSensor(this.name);
        addSmokeDetectedCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "smoke";

function createAccessory(platform, config) {
    return new SmokeSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};
