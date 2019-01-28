'use strict';

const {getState} = require('../../util/Accessory');

const BATTERY_CONFIG = {
    batteryItem: "batteryItem",
    batteryItemInverted: "batteryItemInverted"
};

// This function will try and add a battery warning characteristic to the provided service
function addBatteryWarningCharacteristic(service) {
    try {
        let [batteryItem] = this._getAndCheckItemType(BATTERY_CONFIG.batteryItem, ['Switch', 'Contact']);
        let inverted = this._checkInvertedConf(BATTERY_CONFIG.batteryItemInverted);

        this._log.debug(`Creating battery warning characteristic for ${this.name} [${this._item}]`);

        let batteryTransformation = inverted ? {
            "OFF": 1,
            "ON": 0,
            "CLOSED": 1,
            "OPEN": 0
        } : {
            "OFF": 0,
            "ON": 1,
            "CLOSED": 0,
            "OPEN": 1
        };

        service.getCharacteristic(this.Characteristic.StatusLowBattery)
            .on('get', getState.bind(this, batteryItem, batteryTransformation));

        this._subscribeCharacteristic(service,
            this.Characteristic.StatusLowBattery,
            batteryItem,
            batteryTransformation
        );
    } catch (e) {
        this._log.error(`Not configuring battery warning characteristic for ${this.name}: ${e.message}`);
    }
}

module.exports = {addBatteryWarningCharacteristic};
