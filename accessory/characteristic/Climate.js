'use strict';

const {getState, setState} = require('../../util/Accessory');
const {addNumericSensorCharacteristic, addNumericActorCharacteristic} = require('./Numeric');

const CURRENT_TARGET_CLIMATE_CONFIG = {
    currentTempItem: "currentTempItem", //required
    targetTempItem: "targetTempItem", //required
    currentHumidityItem: "currentHumidityItem",
    targetHumidityItem: "targetHumidityItem",
    heatingItem: "heatingItem", //State mutual Exclusive with coolingItem, 'Switch' type
    coolingItem: "coolingItem", //State mutual Exclusive with heatingItem, 'Switch' type
    mode: "mode",
    modeItem: "modeItem",
    tempUnit: "tempUnit", // 'Celsius' (default), 'Fahrenheit'
    heatingThresholdTempItem: "heatingThresholdTempItem",
    coolingThresholdTempItem: "coolingThresholdTempItem"

};

function addCoolingThresholdCharacteristic(service, optional) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CoolingThresholdTemperature), {item: CURRENT_TARGET_CLIMATE_CONFIG.coolingThresholdTempItem}, optional);
    addNumericActorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CoolingThresholdTemperature), {item: CURRENT_TARGET_CLIMATE_CONFIG.coolingThresholdTempItem}, optional);
}

function addHeatingThresholdCharacteristic(service, optional) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.HeatingThresholdTemperature), {item: CURRENT_TARGET_CLIMATE_CONFIG.heatingThresholdTempItem}, optional);
    addNumericActorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.HeatingThresholdTemperature), {item: CURRENT_TARGET_CLIMATE_CONFIG.heatingThresholdTempItem}, optional);
}

function addCurrentTemperatureCharacteristic(service, optional) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CurrentTemperature), {item: CURRENT_TARGET_CLIMATE_CONFIG.currentTempItem}, optional);
}

function addTargetTemperatureCharacteristic(service, optional) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.TargetTemperature), {item: CURRENT_TARGET_CLIMATE_CONFIG.targetTempItem}, optional);
    addNumericActorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.TargetTemperature), {item: CURRENT_TARGET_CLIMATE_CONFIG.targetTempItem}, optional);
}

function addCurrentRelativeHumidityCharacteristic(service, optional) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity), {item: CURRENT_TARGET_CLIMATE_CONFIG.currentHumidityItem}, optional);
}

function addTargetRelativeHumidityCharacteristic(service, optional) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.TargetRelativeHumidity), {item: CURRENT_TARGET_CLIMATE_CONFIG.targetHumidityItem}, optional);
    addNumericActorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.TargetRelativeHumidity), {item: CURRENT_TARGET_CLIMATE_CONFIG.targetHumidityItem}, optional);
}

function addTemperatureDisplayUnitsCharacteristic(service) {
    switch(this._config[CURRENT_TARGET_CLIMATE_CONFIG.tempUnit]) {
        default:
        case 'Celsius':
            this._tempUnit = this.Characteristic.TemperatureDisplayUnits.CELSIUS;
            break;
        case 'Fahrenheit':
            this._tempUnit = this.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
            break;
    }

    service.getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
        .on('get', function(callback) { callback(null, this._tempUnit) }.bind(this))
        .on('set', function(_, callback) { callback() }.bind(this));
}

function addCurrentHeatingCoolingStateCharacteristic(service) {
    let [heatingItem] = this._getAndCheckItemType(CURRENT_TARGET_CLIMATE_CONFIG.heatingItem, ['Switch', 'Contact'], true);
    let [coolingItem] = this._getAndCheckItemType(CURRENT_TARGET_CLIMATE_CONFIG.coolingItem, ['Switch', 'Contact'], true);

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

        service.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
            .on('get', _getHeatingCoolingState.bind(this, mode, heatingItem, coolingItem));
    }

}

function addTargetHeatingCoolingStateCharacteristic(service) {
    let mode = this._config[CURRENT_TARGET_CLIMATE_CONFIG.mode];
    let modeItem = this._config[CURRENT_TARGET_CLIMATE_CONFIG.modeItem];
    if(mode !== undefined) {
        let modeTransformation = {
            heating: 1,
            cooling: 2,
            heatingCooling: 3
        };
        if (modeTransformation[mode] !== undefined) {
            this._log.debug(`Creating 'TargetHeatingCoolingState' characteristic for ${this.name} with mode set to ${mode}`);
            service.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
                .on('get', function (callback) {
                    callback(modeTransformation[mode]);
                })
                .on('set', function(_, callback) { callback() }.bind(this));
        } else {
            throw new Error(`Target HeatingCooling State mode ${mode} unknown!`);
        }
    } else if (modeItem !== undefined) {
        this._log.debug(`Creating 'TargetHeatingCoolingState' characteristic for ${this.name} with ${modeItem}`);
        addNumericSensorCharacteristic(service, service.getCharacteristic(this.Characteristic.TargetHeatingCoolingState), {item: CURRENT_TARGET_CLIMATE_CONFIG.modeItem});
        addNumericActorCharacteristic(service, service.getCharacteristic(this.Characteristic.TargetHeatingCoolingState), {item: CURRENT_TARGET_CLIMATE_CONFIG.modeItem});
    }
}

function _transformHeatingCoolingState(thisItemMode, characteristic, value) {
    let OFF = 0;
    let HEAT = 1;
    let COOL = 2;

    let currentState = characteristic.value;

    if(thisItemMode === "heating") {
        if(value === "ON") {
            return HEAT;
        } else if(value === "OFF") {
            if(currentState === COOL) {
                return COOL;
            } else {
                return OFF;
            }
        }
    } else if(thisItemMode === "cooling") {
        if(value === "ON") {
            return COOL;
        } else if(value === "OFF") {
            if(currentState === HEAT) {
                return HEAT;
            } else {
                return OFF;
            }
        }
    }
}

function _getHeatingCoolingState(mode, heatingItem, coolingItem, callback) {
    let OFF = 0;
    let HEAT = 1;
    let COOL = 2;

    switch (mode) {
        case "Heating":
            getState.bind(this)(heatingItem, {
                "ON": HEAT,
                "OFF": OFF
            }, callback);
            break;
        case "Cooling":
            getState.bind(this, coolingItem, {
                "ON": COOL,
                "OFF": OFF
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

            if (heatingState === "OFF" && coolingState === "OFF") {
                callback(null, this.Characteristic.CurrentHeatingCoolingState.OFF);
            } else if (heatingState === "ON" && coolingState === "OFF") {
                callback(null, this.Characteristic.CurrentHeatingCoolingState.HEAT);
            } else if (heatingState === "OFF" && coolingState === "ON") {
                callback(null, this.Characteristic.CurrentHeatingCoolingState.COOL);
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

function _setHeatingCoolingState(heatingItem, coolingItem, state, callback) {
    let OFF = 0;
    let HEAT = 1;
    let COOL = 2;

    this._log(`Setting heating cooling state for ${this.name} [Heating Item: ${heatingItem}/Cooling Item: ${coolingItem}] to ${state}`);
    switch(state) {
        default:
        case OFF:
            if(heatingItem) setState.bind(this)(heatingItem, null, "OFF", function(){});
            if(coolingItem) setState.bind(this)(coolingItem, null, "OFF", function(){});
            break;
        case HEAT:
            if(heatingItem) setState.bind(this)(heatingItem, null, "ON", function(){});
            if(coolingItem) setState.bind(this)(coolingItem, null, "OFF", function(){});
            break;
        case COOL:
            if(heatingItem) setState.bind(this)(heatingItem, null, "OFF", function(){});
            if(coolingItem) setState.bind(this)(coolingItem, null, "ON", function(){});
            break;
    }
    callback();
}

module.exports = {
    addTemperatureDisplayUnitsCharacteristic,
    addTargetRelativeHumidityCharacteristic,
    addCurrentRelativeHumidityCharacteristic,
    addTargetTemperatureCharacteristic,
    addCurrentTemperatureCharacteristic,
    addHeatingThresholdCharacteristic,
    addCoolingThresholdCharacteristic,
    addCurrentHeatingCoolingStateCharacteristic,
    addTargetHeatingCoolingStateCharacteristic
};