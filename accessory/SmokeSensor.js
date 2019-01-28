'use strict';

const {Accessory} = require('../util/Accessory');
const {addBinarySensorCharacteristic} = require('./characteristic/BinarySensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class SmokeSensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Smoke Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating occupancy sensor service for ${this.name}`);
        let primaryService = new this.Service.SmokeSensor(this.name);
        addBinarySensorCharacteristic.bind(this)(primaryService, this.Characteristic.SmokeDetected);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "smoke";

function createAccessory(platform, config) {
    return new SmokeSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};
