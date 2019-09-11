'use strict';

const {getState, dummyTransformation} = require('../../util/Util');
const {addNumericSensorCharacteristic}  = require('./Numeric');

const NOTIFICATION_CONFIG = {
    notificationItem: "notificationItem"
};

function addNotificationTextCharacteristic(service) {
    try {
        let [item] = this._getAndCheckItemType(NOTIFICATION_CONFIG.notificationItem, ['String']);
        this._log.debug(`Creating notification text characteristic for ${this.name} with ${item}`);

        service.getCharacteristic(this.Community.NotificationText)
            .on('get', getState.bind(this,
                item,
                dummyTransformation
            ));

        this._subscribeCharacteristic(service.getCharacteristic(this.Community.NotificationText),
            item,
            dummyTransformation
        );
    } catch(e) {
        this._log.debug(`Not configuring notification text characteristic for ${this.name}: ${e.message}`);
        service.removeCharacteristic(this.Community.NotificationText);
    }
}

function addNotificationCodeCharacteristic(service) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Community.NotificationCode), {item: NOTIFICATION_CONFIG.codeItem});
}
module.exports = {
    addNotificationCodeCharacteristic,
    addNotificationTextCharacteristic
};
