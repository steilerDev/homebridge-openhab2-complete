'use strict';

const {getState} = require('../../util/Util');
const {addNumericSensorActorCharacteristic} = require('./Numeric');

const CLIMATE_HUMIDIFIER_DEHUMIDIFIER_CONFIG = {
    dehumidifierThresholdItem: "dehumidifierThresholdItem",
    humidifierThresholdItem: "humidifierThresholdItem",
    humidifierItem: "humidifierItem",
    dehumidifierItem: "dehumidifierItem",
    modeItem: "modeItem"
};

function addCurrentHumidifierDehumidifierStateCharacteristic(service) {
    let [humidifierItem] = this._getAndCheckItemType(CLIMATE_HUMIDIFIER_DEHUMIDIFIER_CONFIG.humidifierItem, ['Switch', 'Contact'], true);
    let [dehumidifierItem] = this._getAndCheckItemType(CLIMATE_HUMIDIFIER_DEHUMIDIFIER_CONFIG.dehumidifierItem, ['Switch', 'Contact'], true);

    let mode;
    if(!(humidifierItem|| dehumidifierItem)) {
        throw new Error(`humidifierItem and/or dehumidifierItem needs to be set: ${JSON.stringify(this._config)}`);
    } else {
        if(humidifierItem) {
            mode = 'humidify';

            this._subscribeCharacteristic(service.getCharacteristic(this.Characteristic.CurrentHumidifierDehumidifierState),
                humidifierItem,
                _transformHumidifierDehumidifierState.bind(this,
                    "humidify",
                    service.getCharacteristic(this.Characteristic.CurrentHumidifierDehumidifierState),
                )
            );
        }
        if(dehumidifierItem) {
            mode = mode === 'humidify' ? 'humidifyDehumidify' : 'dehumidify'; // If heating device was present this means we have Heating Cooling

            this._subscribeCharacteristic(service.getCharacteristic(this.Characteristic.CurrentHumidifierDehumidifierState),
                dehumidifierItem,
                _transformHumidifierDehumidifierState.bind(this,
                    "dehumidify",
                    service.getCharacteristic(this.Characteristic.CurrentHumidifierDehumidifierState),
                )
            );
        }

        this._log.debug(`Creating 'CurrentHumidifierDehumidifierState' characteristic for ${this.name} with mode set to ${mode}`);

        service.getCharacteristic(this.Characteristic.CurrentHumidifierDehumidifierState)
            .on('get', _getHumidifierDehumidifierState.bind(this, mode, humidifierItem, dehumidifierItem));
    }
}

function addTargetHumidifierDehumidifierStateCharacteristic(service) {
    let modeItem = this._config[CLIMATE_HUMIDIFIER_DEHUMIDIFIER_CONFIG.modeItem];
    if (modeItem !== undefined) {
        this._log.debug(`Creating 'TargetHumidifierDehumidifierState' characteristic for ${this.name} with ${modeItem}`);
        addNumericSensorActorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.TargetHumidifierDehumidifierState), {item: CLIMATE_HUMIDIFIER_DEHUMIDIFIER_CONFIG.modeItem});
    } else {
        let mode;
        let HUMIDIFIER_OR_DEHUMIDIFIER = 0; // = Characteristic.TargetHumidifierDehumidifierState.HUMIDIFIER_OR_DEHUMIDIFIER
        let HUMIDIFIER = 1;                 // = Characteristic.TargetHumidifierDehumidifierState.HUMIDIFIER
        let DEHUMIDIFIER = 2;               // = Characteristic.TargetHumidifierDehumidifierState.DEHUMIDIFIER

        if (this._config[CLIMATE_HUMIDIFIER_DEHUMIDIFIER_CONFIG.dehumidifierItem] && this._config[CLIMATE_HUMIDIFIER_DEHUMIDIFIER_CONFIG.humidifierItem]) {
            mode = HUMIDIFIER_OR_DEHUMIDIFIER;
        } else if (this._config[CLIMATE_HUMIDIFIER_DEHUMIDIFIER_CONFIG.dehumidifierItem]) {
            mode = DEHUMIDIFIER;
        } else if (this._config[CLIMATE_HUMIDIFIER_DEHUMIDIFIER_CONFIG.humidifierItem]) {
            mode = HUMIDIFIER;
        } else {
            throw new Error(`Unable to set TargetHumidifierDehumidifierState mode, because neither heating nor cooling item is defined!`);
        }

        this._log.debug(`Creating 'TargetHumidifierDehumidifierState' characteristic for ${this.name} with mode set to ${mode}`);
        service.getCharacteristic(this.Characteristic.TargetHumidifierDehumidifierState)
            .on('get', function (callback) {
                callback(null, mode);
            })
            .on('set', function(_, callback) { callback() }.bind(this));

        if (mode == HUMIDIFIER || mode == DEHUMIDIFIER) {
            service.getCharacteristic(this.Characteristic.TargetHumidifierDehumidifierState).setProps({
                minValue: mode,
                maxValue: mode
            });
        }
    }
}

function _transformHumidifierDehumidifierState(thisItemMode, characteristic, value) {
    let INACTIVE = 0;       // = Characteristic.CurrentHumidifierDehumidifierState.INACTIVE
    let IDLE = 1;           // = Characteristic.CurrentHumidifierDehumidifierState.IDLE
    let HUMIDIFYING = 2;    // = Characteristic.CurrentHumidifierDehumidifierState.HUMIDIFYING
    let DEHUMIDIFYING = 3;  // = Characteristic.CurrentHumidifierDehumidifierState.DEHUMIDIFYING

    let currentState = characteristic.value;

    if(thisItemMode === "humidify") {
        if(value === "ON") {
            return HUMIDIFYING;
        } else if(value === "OFF") {
            if(currentState === DEHUMIDIFYING) {
                return DEHUMIDIFYING;
            } else {
                return IDLE;
            }
        }
    } else if(thisItemMode === "dehumidify") {
        if(value === "ON") {
            return DEHUMIDIFYING;
        } else if(value === "OFF") {
            if(currentState === HUMIDIFYING) {
                return HUMIDIFYING;
            } else {
                return IDLE;
            }
        }
    }
}

function _getHumidifierDehumidifierState(mode, humidifierItem, dehumidifierItem, callback) {
    let INACTIVE = 0;       // = Characteristic.CurrentHumidifierDehumidifierState.INACTIVE = 0;
    let IDLE = 1;           // = Characteristic.CurrentHumidifierDehumidifierState.IDLE = 1;
    let HUMIDIFYING = 2;    // = Characteristic.CurrentHumidifierDehumidifierState.HUMIDIFYING = 2;
    let DEHUMIDIFYING = 3;  // = Characteristic.CurrentHumidifierDehumidifierState.DEHUMIDIFYING = 3;

    switch (mode) {
        case "humidify":
            getState.bind(this)(humidifierItem, {
                "ON": HUMIDIFYING,
                "OFF": IDLE
            }, callback);
            break;
        case "dehumidify":
            getState.bind(this)(dehumidifierItem, {
                "ON": DEHUMIDIFYING,
                "OFF": IDLE
            }, callback);
            break;
        case "humidifyDehumidify":
            this._log.debug(`Getting humidifier/dehumidifier state for ${this.name} [${humidifierItem} & ${dehumidifierItem}]`);
            let dehumidifierState = this._openHAB.getStateSync(dehumidifierItem);
            let humidifierState = this._openHAB.getStateSync(humidifierItem);
            if (dehumidifierState instanceof Error) {
                callback(dehumidifierState);
            }
            if (humidifierState instanceof Error) {
                callback(humidifierState);
            }

            if (humidifierState === "OFF" && dehumidifierState === "OFF") {
                callback(null, IDLE);
            } else if (humidifierState === "ON" && dehumidifierState === "OFF") {
                callback(null, HUMIDIFYING);
            } else if (humidifierState === "OFF" && dehumidifierState === "ON") {
                callback(null, DEHUMIDIFYING);
            } else {
                let msg = `Combination of humidifying state (${humidifierState}) and dehumidifying state (${dehumidifierState}) not allowed!`;
                this._log.error(msg);
                callback(new Error(msg));
            }
            break;
        default:
            let msg = `Unable to get Dehumidifier/Humidifier state for mode ${this._mode}`;
            this._log.error(msg);
            callback(new Error(msg));
    }
}

module.exports = {
    addCurrentHumidifierDehumidifierStateCharacteristic,
    addTargetHumidifierDehumidifierStateCharacteristic
};