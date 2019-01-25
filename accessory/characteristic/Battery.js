'use strict';

const {getState} = require('../Accessory');

const BATTERY_CONFIG = {
    batteryItem: "batteryItem",
    batteryItemInverted: "batteryItemInverted"
};

// This function will try and add a battery warning characteristic to the provided service
function addBatteryWarningCharacteristic(accessory, service) {
    try {
        if (accessory._config[BATTERY_CONFIG.batteryItem]) {
            let batteryItem = accessory._config[BATTERY_CONFIG.batteryItem];
            accessory._getAndCheckItemType(batteryItem, ['Switch', 'Contact']);

            let inverted = false;
            if(this._config[BATTERY_CONFIG.batteryItemInverted] && (this._config[BATTERY_CONFIG.batteryItemInverted] === "false" || this._config[BATTERY_CONFIG.batteryItemInverted] === "true")) {
                inverted = this._config[BATTERY_CONFIG.batteryItemInverted] === "true";
            }

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

            service.getCharacteristic(accessory.Characteristic.StatusLowBattery)
                .on('get', getState.bind(accessory, batteryItem, batteryTransformation));
        }
    } catch (e) {
        accessory._log.error(`Not configuring battery for ${accessory.name}: ${e.message}`);
    }
}

module.exports = {addBatteryWarningCharacteristic};
