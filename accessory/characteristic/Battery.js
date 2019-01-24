'use strict';

let BATTERY_CONFIG = {
    habBatteryItem: "habBatteryItem",
    habBatteryItemStateWarning: "habBatteryItemStateWarning"
};

// This function will try and add a battery warning characteristic to the provided service
export function addBatteryWarningCharacteristic(accessory, service) {
    try {
        if (accessory._config[BATTERY_CONFIG.habBatteryItem]) {
            let habBatteryItem = accessory._config[BATTERY_CONFIG.habBatteryItem];
            accessory._getAndCheckItemType(habBatteryItem, ['Switch']);

            let batteryItemStateWarning = "ON";
            if (accessory._config[BATTERY_CONFIG.habBatteryItemStateWarning]) {
                batteryItemStateWarning = accessory._config[BATTERY_CONFIG.habBatteryItemStateWarning];
            }

            service.getCharacteristic(accessory.Characteristic.StatusLowBattery)
                .on('get', getState.bind(accessory, habBatteryItem, {
                        [batteryItemStateWarning] : 1,
                        "_default": 0
                    }
                ));
        }
    } catch (e) {
        accessory._log.error(`Not configuring battery for ${accessory.name}: ${e.message}`);
    }
}
