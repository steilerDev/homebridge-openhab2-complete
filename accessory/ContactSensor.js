'use strict';

const {Accessory} = require('../util/Accessory');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');
const {addContactSensorCharacteristic} = require('./characteristic/BinarySensor');

class ContactSensorAccessory extends Accessory {
    _getPrimaryService() {
        this._log.debug(`Creating contact sensor service for ${this.name}`);
        let primaryService = new this.Service.ContactSensor(this.name);
        addContactSensorCharacteristic.bind(this)(primaryService);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "contact";

function createAccessory(platform, config) {
    return new ContactSensorAccessory(platform, config, 'Contact Sensor');
}

module.exports = {createAccessory, type};

