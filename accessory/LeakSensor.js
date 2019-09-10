'use strict';

const {Accessory} = require('../util/Accessory');
const {addLeakDetectedCharacteristic} = require('./characteristic/Binary');

class LeakSensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);
        this._services.unshift(this._getAccessoryInformationService('Leak Sensor'));
        this._services.push(this._getPrimaryService());
    }

    _getPrimaryService() {
        this._log.debug(`Creating leak sensor service for ${this.name}`);
        let primaryService = new this.Service.LeakSensor(this.name);
        addLeakDetectedCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "leak";

function createAccessory(platform, config) {
    return new LeakSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};
