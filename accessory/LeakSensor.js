'use strict';

const {Accessory} = require('../util/Accessory');
const {addBinarySensorCharacteristic} = require('./characteristic/BinarySensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class LeakSensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Leak Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating leak sensor service for ${this.name}`);
        let primaryService = new this.Service.LeakSensor(this.name);
        addBinarySensorCharacteristic(this)(primaryService, this.Characteristic.LeakDetected);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "leak";

function createAccessory(platform, config) {
    return new LeakSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};
