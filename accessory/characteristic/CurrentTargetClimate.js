'use strict';

const {addTargetStateCharacteristic, addCurrentStateCharacteristic} = require('./CurrentTarget');
const {getState, setState, dummyTransformation} = require('../../util/Accessory');
const {addNumericSensorCharacteristic} = require('./NumericSensor');

const CURRENT_TARGET_CLIMATE_CONFIG = {
    currentTempItem: "currentTempItem", //required
    targetTempItem: "targetTempItem", //required
    currentHumidityItem: "currentHumidityItem",
    targetHumidityItem: "targetHumidityItem",
    heatingItem: "heatingItem", //State mutual Exclusive with coolingItem, 'Switch' type
    coolingItem: "coolingItem", //State mutual Exclusive with heatingItem, 'Switch' type
    heatingCoolingItem: "heatingCoolingItem",
    tempUnit: "tempUnit", // 'Celsius' (default), 'Fahrenheit'
    heatingThresholdTempItem: "heatingThresholdTempItem",
    coolingThresholdTempItem: "coolingThresholdTempItem"

};

function addCoolingThresholdCharacteristic(service, optional) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CoolingThresholdTemperature), {item: CURRENT_TARGET_CLIMATE_CONFIG.coolingThresholdTempItem}, optional);
}

function addHeatingThresholdCharacteristic(service, optional) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.HeatingThresholdTemperature), {item: CURRENT_TARGET_CLIMATE_CONFIG.heatingThresholdTempItem}, optional);
}

function addCurrentTemperatureCharacteristic(service, optional) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CurrentTemperature), {item: CURRENT_TARGET_CLIMATE_CONFIG.currentTempItem}, optional);
}

function addTargetTemperatureCharacteristic(service, optional) {
    try {
        let [targetTempItem, targetTempType] = this._getAndCheckItemType(CURRENT_TARGET_CLIMATE_CONFIG.targetTempItem, ['Number']);
        addTargetStateCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.TargetTemperature),
            targetTempItem,
            targetTempType,
            false,
            targetTempItem,
            targetTempType,
            false,
            dummyTransformation,
            dummyTransformation
        );
    } catch(e) {
        let msg = `Not configuring 'TargetTemperature' characteristic for ${this.name}: ${e.message}`;
        service.removeCharacteristic(this.Characteristic.TargetTemperature);
        if(optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
}

function addCurrentRelativeHumidityCharacteristic(service, optional) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity), {item: CURRENT_TARGET_CLIMATE_CONFIG.currentHumidityItem}, optional);
}

function addTargetRelativeHumidityCharacteristic(service, optional) {
    try {
        let [targetHumidityItem, targetHumidityType] = this._getAndCheckItemType(CURRENT_TARGET_CLIMATE_CONFIG.targetHumidityItem, ['Number']);
        addTargetStateCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.TargetRelativeHumidity),
            targetHumidityItem,
            targetHumidityType,
            false,
            targetHumidityItem,
            targetHumidityType,
            false,
            dummyTransformation,
            dummyTransformation
        );
    } catch(e) {
        let msg = `Not configuring 'TargetRelativeHumidity' characteristic for ${this.name}: ${e.message}`;
        service.removeCharacteristic(this.Characteristic.TargetRelativeHumidity);
        if(optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
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

function addHeatingCoolingStateCharacteristic(service) {
    let [heatingItem] = this._getAndCheckItemType(CURRENT_TARGET_CLIMATE_CONFIG.heatingItem, ['Switch', 'Contact'], true);
    let [coolingItem] = this._getAndCheckItemType(CURRENT_TARGET_CLIMATE_CONFIG.coolingItem, ['Switch', 'Contact'], true);
    let [heatingCoolingItem, heatingCoolingItemType] = this._getAndCheckItemType(CURRENT_TARGET_CLIMATE_CONFIG.heatingCoolingItem, ['Number'], true);
    let mode;

    if(!(heatingItem || coolingItem || heatingCoolingItem)) {
        throw new Error(`heatingItem and/or coolingItem needs to be set: ${JSON.stringify(this._config)}`);
    } else if(heatingCoolingItem) {
        addCurrentStateCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState),
            heatingCoolingItem,
            heatingCoolingItemType,
            false,
            dummyTransformation
        );

        addTargetStateCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.TargetHeatingCoolingState),
            heatingCoolingItem,
            heatingCoolingItemType,
            false,
            heatingCoolingItem,
            heatingCoolingItemType,
            false,
            dummyTransformation,
            dummyTransformation
        );

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

        service.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
            .on('get', _getHeatingCoolingState.bind(this, mode, heatingItem, coolingItem))
            .on('set', _setHeatingCoolingState.bind(this, heatingItem, coolingItem));
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
    addHeatingCoolingStateCharacteristic,
    addTemperatureDisplayUnitsCharacteristic,
    addTargetRelativeHumidityCharacteristic,
    addCurrentRelativeHumidityCharacteristic,
    addTargetTemperatureCharacteristic,
    addCurrentTemperatureCharacteristic,
    addHeatingThresholdCharacteristic,
    addCoolingThresholdCharacteristic
};