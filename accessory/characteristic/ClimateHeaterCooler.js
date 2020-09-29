'use strict';

const {getState} = require('../../util/Util');
const {addNumericSensorActorCharacteristic} = require('./Numeric');

const CLIMATE_HEATER_COOLER_CONFIG = {
    heatingItem: "heatingItem",
    coolingItem: "coolingItem",
    modeItem: "modeItem"
};

function addCurrentHeaterCoolerStateCharacteristic(service) {
    let [heatingItem] = this._getAndCheckItemType(CLIMATE_HEATER_COOLER_CONFIG.heatingItem, ['Switch', 'Contact'], true);
    let [coolingItem] = this._getAndCheckItemType(CLIMATE_HEATER_COOLER_CONFIG.coolingItem, ['Switch', 'Contact'], true);

    let mode;
    if(!(heatingItem|| coolingItem)) {
        throw new Error(`heatingItem and/or coolingItem needs to be set: ${JSON.stringify(this._config)}`);
    } else {
        if(heatingItem) {
            mode = 'heating';

            this._subscribeCharacteristic(service.getCharacteristic(this.Characteristic.CurrentHeaterCoolerState),
                heatingItem,
                _transformHeaterCoolerState.bind(this,
                    "heating",
                    service.getCharacteristic(this.Characteristic.CurrentHeaterCoolerState),
                )
            );
        }
        if(coolingItem) {
            mode = mode === 'heating' ? 'heatingCooling' : 'cooling'; // If heating device was present this means we have Heating Cooling

            this._subscribeCharacteristic(service.getCharacteristic(this.Characteristic.CurrentHeaterCoolerState),
                coolingItem,
                _transformHeaterCoolerState.bind(this,
                    "cooling",
                    service.getCharacteristic(this.Characteristic.CurrentHeaterCoolerState),
                )
            );
        }

        this._log.debug(`Creating 'CurrentHeaterCoolerState' characteristic for ${this.name} with mode set to ${mode}`);

        service.getCharacteristic(this.Characteristic.CurrentHeaterCoolerState)
            .on('get', _getHeaterCoolerState.bind(this, mode, heatingItem, coolingItem));
    }
}

function addTargetHeaterCoolerStateCharacteristic(service) {
    let modeItem = this._config[CLIMATE_HEATER_COOLER_CONFIG.modeItem];
    if (modeItem !== undefined) {
        this._log.debug(`Creating 'TargetHeaterCoolerState' characteristic for ${this.name} with ${modeItem}`);
        addNumericSensorActorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.TargetHeaterCoolerState), {item: CLIMATE_HEATER_COOLER_CONFIG.modeItem});
    } else {
        let mode;
        let AUTO = 0; // = Characteristic.TargetHeaterCoolerState.AUTO
        let HEAT = 1; // = Characteristic.TargetHeaterCoolerState.HEAT
        let COOL = 2; // = Characteristic.TargetHeaterCoolerState.COOL

        if (this._config[CLIMATE_HEATER_COOLER_CONFIG.heatingItem] && this._config[CLIMATE_HEATER_COOLER_CONFIG.coolingItem]) {
            mode = AUTO;
        } else if (this._config[CLIMATE_HEATER_COOLER_CONFIG.heatingItem]) {
            mode = HEAT;
        } else if (this._config[CLIMATE_HEATER_COOLER_CONFIG.coolingItem]) {
            mode = COOL;
        } else {
            throw new Error(`Unable to set 'TargetHeaterCoolingState' mode, because neither heating nor cooling item is defined!`);
        }

        this._log.debug(`Creating 'TargetHeaterCoolingState' characteristic for ${this.name} with mode set to ${mode}`);
        service.getCharacteristic(this.Characteristic.TargetHeaterCoolerState)
            .on('get', function (callback) {
                callback(null, mode);
            })
            .on('set', function(_, callback) { callback() }.bind(this));
    }
}

function _transformHeaterCoolerState(thisItemMode, characteristic, value) {
    let INACTIVE = 0;   // = Characteristic.CurrentHeaterCoolerState.INACTIVE
    let IDLE = 1;       // = Characteristic.CurrentHeaterCoolerState.IDLE
    let HEATING = 2;    // = Characteristic.CurrentHeaterCoolerState.HEATING
    let COOLING = 3;    // = Characteristic.CurrentHeaterCoolerState.COOLING

    let currentState = characteristic.value;

    if(thisItemMode === "heating") {
        if(value === "ON") {
            return HEATING;
        } else if(value === "OFF") {
            if(currentState === COOLING) {
                return COOLING;
            } else {
                return IDLE;
            }
        }
    } else if(thisItemMode === "cooling") {
        if(value === "ON") {
            return COOLING;
        } else if(value === "OFF") {
            if(currentState === HEATING) {
                return HEATING;
            } else {
                return IDLE;
            }
        }
    }
}

function _getHeaterCoolerState(mode, heatingItem, coolingItem, callback) {
    let INACTIVE = 0;   // = Characteristic.CurrentHeaterCoolerState.INACTIVE
    let IDLE = 1;       // = Characteristic.CurrentHeaterCoolerState.IDLE
    let HEATING = 2;    // = Characteristic.CurrentHeaterCoolerState.HEATING
    let COOLING = 3;    // = Characteristic.CurrentHeaterCoolerState.COOLING

    switch (mode) {
        case "heating":
            getState.bind(this)(heatingItem, {
                "ON": HEATING,
                "OFF": IDLE
            }, callback);
            break;
        case "cooling":
            getState.bind(this, coolingItem, {
                "ON": COOLING,
                "OFF": IDLE
            }, callback);
            break;
        case "heatingCooling":
            this._log.debug(`Getting heating/cooling state for ${this.name} [${heatingItem} & ${coolingItem}]`);
            let heatingState = this._openHAB.getStateSync(heatingItem);
            let coolingState = this._openHAB.getStateSync(coolingItem);
            if (heatingState instanceof Error) {
                callback(heatingItem);
            }
            if (coolingState instanceof Error) {
                callback(coolingState);
            }

            if (coolingState === "OFF" && heatingState === "OFF") {
                callback(null, IDLE);
            } else if (coolingState === "ON" && heatingState === "OFF") {
                callback(null, COOLING);
            } else if (coolingState === "OFF" && heatingState === "ON") {
                callback(null, HEATING);
            } else {
                let msg = `Combination of heating state (${heatingState}) and cooling state (${coolingState}) not allowed!`;
                this._log.error(msg);
                callback(new Error(msg));
            }
            break;
        default:
            let msg = `Unable to get Heater/Cooler state for mode ${this._mode}`;
            this._log.error(msg);
            callback(new Error(msg));
    }
}

module.exports = {
    addCurrentHeaterCoolerStateCharacteristic,
    addTargetHeaterCoolerStateCharacteristic
};