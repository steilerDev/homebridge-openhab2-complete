'use strict';

const {getState} = require('../../util/Accessory');
const {addNumericSensorCharacteristic, addNumericSensorActorCharacteristic} = require('./Numeric');

const CLIMATE_THERMOSTAT_CONFIG = {
    heatingItem: "heatingItem", //State mutual Exclusive with coolingItem, 'Switch' or 'Contact' type
    coolingItem: "coolingItem", //State mutual Exclusive with heatingItem, 'Switch' or 'Contact' type
    modeItem: "modeItem",
};

function addCurrentHeatingCoolingStateCharacteristic(service) {
    let [heatingItem] = this._getAndCheckItemType(CLIMATE_THERMOSTAT_CONFIG.heatingItem, ['Switch', 'Contact'], true);
    let [coolingItem] = this._getAndCheckItemType(CLIMATE_THERMOSTAT_CONFIG.coolingItem, ['Switch', 'Contact'], true);

    let mode;
    if(!(heatingItem || coolingItem)) {
        throw new Error(`heatingItem and/or coolingItem needs to be set: ${JSON.stringify(this._config)}`);
    } else {
        if(heatingItem) {
            mode = 'Heating';

            this._subscribeCharacteristic(service.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState),
                heatingItem,
                _transformHeatingCoolingState.bind(this,
                    "heating",
                    service.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState),
                )
            );
        }
        if(coolingItem) {
            mode = mode === 'Heating' ? 'HeatingCooling' : 'Cooling'; // If heating device was present this means we have Heating Cooling

            this._subscribeCharacteristic(service.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState),
                coolingItem,
                _transformHeatingCoolingState.bind(this,
                    "cooling",
                    service.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState),
                )
            );
        }

        this._log.debug(`Creating 'CurrentHeatingCoolingState' characteristic for ${this.name} with mode set to ${mode}`);
        service.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
            .on('get', _getHeatingCoolingState.bind(this, mode, heatingItem, coolingItem));
    }
}

function addTargetHeatingCoolingStateCharacteristic(service) {
    let modeItem = this._config[CLIMATE_THERMOSTAT_CONFIG.modeItem];
    if (modeItem !== undefined) {
        this._log.debug(`Creating 'TargetHeatingCoolingState' characteristic for ${this.name} with ${modeItem}`);
        addNumericSensorActorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.TargetHeatingCoolingState), {item: CLIMATE_THERMOSTAT_CONFIG.modeItem});
    } else {
        let mode;
        let HEAT = 1;
        let COOL = 2;
        let AUTO = 3;

        if (this._config[CLIMATE_THERMOSTAT_CONFIG.coolingItem] && this._config[CLIMATE_THERMOSTAT_CONFIG.heatingItem]) {
            mode = AUTO;
        } else if (this._config[CLIMATE_THERMOSTAT_CONFIG.coolingItem]) {
            mode = COOL;
        } else if (this._config[CLIMATE_THERMOSTAT_CONFIG.heatingItem]) {
            mode = HEAT;
        } else {
            throw new Error(`Unable to set 'TargetHeatingCoolingState' mode, because neither heating nor cooling item is defined!`);
        }

        this._log.debug(`Creating 'TargetHeatingCoolingState' characteristic for ${this.name} with mode set to ${mode}`);
        service.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
            .on('get', function (callback) {
                callback(null, mode);
            })
            .on('set', function(_, callback) { callback() }.bind(this));

    }
}

function _transformHeatingCoolingState(thisItemMode, characteristic, value) {
    let OFF = 0;
    let HEAT = 1;
    let COOL = 2;

    let currentState = characteristic.value;

    if(thisItemMode === "heating") {
        if(value === "ON" || value === "OPEN") {
            return HEAT;
        } else if(value === "OFF" || value === "CLOSED") {
            if(currentState === COOL) {
                return COOL;
            } else {
                return OFF;
            }
        }
    } else if(thisItemMode === "cooling") {
        if(value === "ON" || value === "OPEN") {
            return COOL;
        } else if(value === "OFF" || value === "CLOSED") {
            if(currentState === HEAT) {
                return HEAT;
            } else {
                return OFF;
            }
        }
    }
}

function _getHeatingCoolingState(mode, heatingItem, coolingItem, callback) {
    let OFF = 0;  // = Characteristic.CurrentHeatingCoolingState.OFF
    let HEAT = 1; // = Characteristic.CurrentHeatingCoolingState.HEAT
    let COOL = 2; // = Characteristic.CurrentHeatingCoolingState.COOL

    switch (mode) {
        case "Heating":
            getState.bind(this)(heatingItem, {
                "ON": HEAT,
                "OFF": OFF,
                "OPEN": HEAT,
                "CLOSED": OFF
            }, callback);
            break;
        case "Cooling":
            getState.bind(this, coolingItem, {
                "ON": COOL,
                "OFF": OFF,
                "OPEN": COOL,
                "CLOSED": OFF
            }, callback);
            break;
        case "HeatingCooling":
            this._log.debug(`Getting heating/cooling state for ${this.name} [${heatingItem} & ${coolingItem}]`);
            let coolingState = this._openHAB.getStateSync(coolingItem);
            let heatingState = this._openHAB.getStateSync(heatingItem);
            if (coolingState instanceof Error) {
                callback(coolingState);
            }
            if (heatingState instanceof Error) {
                callback(heatingState);
            }

            if ((heatingState === "OFF" || heatingState === "CLOSED") && (coolingState === "OFF" || coolingState === "CLOSED")) {
                callback(null, OFF);
            } else if ((heatingState === "ON" || heatingState === "OPEN") && (coolingState === "OFF" || coolingState === "CLOSED")) {
                callback(null, HEAT);
            } else if ((heatingState === "OFF" || heatingState === "CLOSED") && (coolingState === "ON" || coolingState === "OPEN")) {
                callback(null, COOL);
            } else {
                let msg = `Combination of heating state (${heatingState}) and cooling state (${coolingState}) not allowed!`;
                this._log.error(msg);
                callback(new Error(msg));
            }
            break;
        default:
            let msg = `Unable to get HeatingCooling state for mode ${this._mode}`;
            this._log.error(msg);
            callback(new Error(msg));
    }
}

module.exports = {
    addCurrentHeatingCoolingStateCharacteristic,
    addTargetHeatingCoolingStateCharacteristic
};