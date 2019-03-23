'use strict';

const {getState} = require('../../util/Accessory');
const {addBinarySensorCharacteristic} = require('./BinarySensor');
const {addNumericSensorCharacteristic} = require('./Numeric');

const BATTERY_CONFIG = {
    batteryItem: "batteryItem",
    batteryItemInverted: "batteryItemInverted",
    batteryItemThreshold: "batteryItemThreshold",
    batteryChargingItem: "batteryChargingItem",
    batteryChargingItemInverted: "batteryChargingItemInverted"
};

const DEFAULT_BATTERY_THRESHOLD = 10;

// This function will try and add a battery warning characteristic to the provided service
function addBatteryWarningCharacteristic(service, optional) {
    try {
        let [batteryItem, batteryItemType] = this._getAndCheckItemType(BATTERY_CONFIG.batteryItem, ['Switch', 'Contact', 'Number']);
        let batteryTransformation;

        const BATTERY_LEVEL_NORMAL = 0; // = Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
        const BATTERY_LEVEL_LOW = 1;    // = Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW


        if(batteryItemType === "Number") {
            let thresholdConfig = parseFloat(this._config[BATTERY_CONFIG.batteryItemThreshold]);
            let threshold = thresholdConfig !== undefined && !isNaN(thresholdConfig) ? thresholdConfig : DEFAULT_BATTERY_THRESHOLD;

            this._log.debug(`Creating battery warning characteristic for ${this.name} with item ${batteryItem} and battery warning threshold set to ${threshold}`);

            batteryTransformation = function (value) {
                let parsedValue = parseFloat(value);
                if(isNaN(parsedValue) || parsedValue <= threshold) {
                    return BATTERY_LEVEL_LOW;
                } else {
                    return BATTERY_LEVEL_NORMAL;
                }
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
        let msg = `Not configuring binary sensor characteristic for ${this.name}: ${e.message}`;
        service.removeCharacteristic(this.Characteristic.StatusLowBattery);
        if(optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
}

function addChargingStateCharacteristic(service) {
    try {
        addBinarySensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.ChargingState), {item: BATTERY_CONFIG.batteryChargingItem, inverted: BATTERY_CONFIG.batteryChargingItemInverted});
    } catch (e) {
        this._log.debug(`Setting charging state to 'Not-Chargeable'`);
        let NOT_CHARGEABLE = 2; // == Characteristic.ChargingState.NOT_CHARGEABLE

        service.getCharacteristic(this.Characteristic.ChargingState).on('get', function(callback) {
            callback(null, NOT_CHARGEABLE);
        });
    }
}

function addBatteryLevelCharacteristic(service) {
    addNumericSensorCharacteristic(service, service.getCharacteristic(this.Characteristic.BatteryLevel),{item: BATTERY_CONFIG.batteryItem});
}

function getBatteryService() {
    try {
        let batteryService = new this.Service.BatteryService('Battery');
        addBatteryLevelCharacteristic.bind(this)(batteryService);
        addBatteryWarningCharacteristic.bind(this)(batteryService);
        addChargingStateCharacteristic.bind(this)(batteryService);
        return batteryService;
    } catch (e) {
        this._log.debug(`Not adding battery service: ${e.message}`);
        return null;
    }
}

module.exports = {addBatteryWarningCharacteristic, getBatteryService};