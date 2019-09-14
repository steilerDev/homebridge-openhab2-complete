'use strict';

const {getState} = require('../../util/Util');
const {addNumericSensorCharacteristic} = require('./Numeric');
const {addBinarySensorCharacteristicWithTransformation} = require('./Binary');

const BATTERY_CONFIG = {
    batteryItem: "batteryItem",
    batteryItemThreshold: "batteryItemThreshold",
    batteryItemInverted: "batteryItemInverted",
    batteryItemChargingState: "batteryItemChargingState",
    batteryItemChargingStateInverted: "batteryItemChargingStateInverted"
};

const DEFAULT_BATTERY_THRESHOLD = 20;

// This function will try and add a battery warning characteristic to the provided service
function addBatteryWarningCharacteristic(service, optional) {
    try {
        let [batteryItem, batteryItemType] = this._getAndCheckItemType(BATTERY_CONFIG.batteryItem, ['Switch', 'Contact', 'Number']);
        let batteryTransformation;

        const BATTERY_LEVEL_NORMAL = 0;
        const BATTERY_LEVEL_LOW = 1;

        if(batteryItemType === "Number") {
            let threshold = DEFAULT_BATTERY_THRESHOLD;

            if(this._config[BATTERY_CONFIG.batteryItemThreshold]) {
                threshold = parseInt(this._config[BATTERY_CONFIG.batteryItemThreshold]);
            } else {
                this._log.warn(`${BATTERY_CONFIG.batteryItemThreshold} for ${this.name} not defined, using default threshold of ${DEFAULT_BATTERY_THRESHOLD}`);
            }
            this._log.debug(`Creating battery warning characteristic for ${this.name} with item ${batteryItem} and threshold set to ${threshold}`);

           batteryTransformation = function(val) {
               return val < threshold ? BATTERY_LEVEL_LOW : BATTERY_LEVEL_NORMAL;
           }
        } else {
            let inverted = this._checkInvertedConf(BATTERY_CONFIG.batteryItemInverted);

            this._log.debug(`Creating battery warning characteristic for ${this.name} with item ${batteryItem} and inverted set to ${inverted}`);

            batteryTransformation = inverted ? {
                "OFF": BATTERY_LEVEL_LOW,
                "ON": BATTERY_LEVEL_NORMAL,
                "CLOSED": BATTERY_LEVEL_LOW,
                "OPEN": BATTERY_LEVEL_NORMAL
            } : {
                "OFF": BATTERY_LEVEL_NORMAL,
                "ON": BATTERY_LEVEL_LOW,
                "CLOSED": BATTERY_LEVEL_NORMAL,
                "OPEN": BATTERY_LEVEL_LOW
            };
        }

        service.getCharacteristic(this.Characteristic.StatusLowBattery)
            .on('get', getState.bind(this, batteryItem, batteryTransformation));

        this._subscribeCharacteristic(service.getCharacteristic(this.Characteristic.StatusLowBattery),
            batteryItem,
            batteryTransformation
        );
    } catch (e) {
        let msg = `Not configuring battery warning characteristic for ${this.name}: ${e.message}`;
        service.removeCharacteristic(this.Characteristic.StatusLowBattery);
        if(optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
}

function addBatteryLevelCharacteristic(service) {
    addNumericSensorCharacteristic.bind(this)(service,
        service.getCharacteristic(this.Characteristic.BatteryLevel),
        {item: BATTERY_CONFIG.batteryItem},
        true
    );
}

function addChargingStateCharacteristic(service) {
    const NOT_CHARGING = 0;
    const CHARGING = 1;
    const NOT_CHARGEABLE = 2;

    let chargingStateCharacteristic = service.getCharacteristic(this.Characteristic.ChargingState);

    try {
        this._getAndCheckItemType(BATTERY_CONFIG.batteryItemChargingState, ['Contact', 'Switch']);
        let inverted = this._checkInvertedConf(BATTERY_CONFIG.batteryItemChargingStateInverted);
        let transformation = {
            "OFF": inverted ? CHARGING : NOT_CHARGING,
            "ON": inverted ? NOT_CHARGING : CHARGING,
            "CLOSED": inverted ? CHARGING : NOT_CHARGING,
            "OPEN": inverted ? NOT_CHARGING : CHARGING
        };
        addBinarySensorCharacteristicWithTransformation.bind(this)(service,
            chargingStateCharacteristic,
            {item: BATTERY_CONFIG.batteryItemChargingState, inverted: BATTERY_CONFIG.batteryItemChargingStateInverted},
            transformation
        );
    } catch (e) {
        this._log.debug(`Not adding charging state characteristic, adding default behaviour: ${e}`);
        chargingStateCharacteristic.setValue(NOT_CHARGEABLE);
    }
}

module.exports = {
    addBatteryWarningCharacteristic,
    addChargingStateCharacteristic,
    addBatteryLevelCharacteristic
};
