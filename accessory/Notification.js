'use strict';

const {Accessory} = require('../util/Accessory');
const {addNotificationCodeCharacteristic, addNotificationTextCharacteristic} = require('./characteristic/Notification');

class NotificationAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);
        this._services.unshift(this._getAccessoryInformationService('Notification'));
        this._services.push(this._getPrimaryService());
    }

    _getPrimaryService() {
        this._log.debug(`Creating notification service for ${this.name}`);
        let primaryService = new this.Community.NotificationService(this.name);
        addNotificationCodeCharacteristic.bind(this)(primaryService);
        addNotificationTextCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "notification";

function createAccessory(platform, config) {
    return new NotificationAccessory(platform, config);
}

module.exports = {createAccessory, type};

