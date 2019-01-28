'use strict';

const {Accessory} = require('../util/Accessory');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');
const {addBinarySensorCharacteristic} = require('./characteristic/BinarySensor');

class ContactSensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Contact Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating contact sensor service for ${this.name}`);
        let primaryService = new this.Service.ContactSensor(this.name);
        addBinarySensorCharacteristic.bind(this)(primaryService, this.Characteristic.ContactSensorState);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "contact";

function createAccessory(platform, config) {
    return new ContactSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};

