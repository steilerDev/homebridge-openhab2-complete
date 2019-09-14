'use strict';

const {Accessory} = require('../util/Accessory');
const {addContactSensorCharacteristic} = require('./characteristic/Binary');

class ContactSensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);
        this._services.unshift(this._getAccessoryInformationService('Contact Sensor'));
        this._services.push(this._getPrimaryService());
    }

    _getPrimaryService() {
        this._log.debug(`Creating contact sensor service for ${this.name}`);
        let primaryService = new this.Service.ContactSensor(this.name);
        addContactSensorCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "contact";

function createAccessory(platform, config) {
    return new ContactSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};

