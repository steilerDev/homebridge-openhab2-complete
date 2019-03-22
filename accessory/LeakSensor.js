'use strict';

const {Accessory} = require('../util/Accessory');
const {addLeakDetectedCharacteristic} = require('./characteristic/BinarySensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class LeakSensorAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config, 'Leak Sensor');
    }

    _getPrimaryService() {
        this._log.debug(`Creating leak sensor service for ${this.name}`);
        let primaryService = new this.Service.LeakSensor(this.name);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        addLeakDetectedCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "leak";

function createAccessory(platform, config) {
    return new LeakSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};
