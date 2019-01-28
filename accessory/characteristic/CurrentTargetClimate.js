'use strict';

const {addTargetStateCharacteristic, addCurrentStateCharacteristic} = require('./CurrentTarget');
const {getState, setState} = require('../../util/Accessory');

const CURRENT_TARGET_CLIMATE_CONFIG = {
    currentTempItem: "currentTempItem", //required
    targetTempItem: "targetTempItem", //required
    currentHumidityItem: "currentHumidityItem",
    targetHumidityItem: "targetHumidityItem",
    heatingItem: "heatingItem", //State mutual Exclusive with coolingItem, 'Switch' type
    coolingItem: "coolingItem", //State mutual Exclusive with heatingItem, 'Switch' type
    tempUnit: "tempUnit" // 'Celsius' (default), 'Fahrenheit'
};

function addCurrentTemperatureCharacteristic(service, optional) {
    try {
        let [currentTempItem, currentTempType] = this._getAndCheckItemType(CURRENT_TARGET_CLIMATE_CONFIG.currentTempItem, ['Number']);
        addCurrentStateCharacteristic.bind(this)(service,
            this.Characteristic.CurrentTemperature,
            currentTempItem,
            currentTempType,
            false,
            dummyTransformation
        );
    } catch(e) {
        let msg = `Not configuring 'CurrentTemperature' characteristic for ${this.name}: ${e.message}`;
        if(optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
}

function addTargetTemperatureCharacteristic(service, optional) {
    try {
        let [targetTempItem, targetTempType] = this._getAndCheckItemType(CURRENT_TARGET_CLIMATE_CONFIG.targetTempItem, ['Number']);
        addTargetStateCharacteristic.bind(this)(service,
            this.Characteristic.TargetTemperature,
            targetTempItem,
            targetTempType,
            false,
            targetTempItem,
            targetTempType,
            false,
            dummyTransformation
        );
    } catch(e) {
        let msg = `Not configuring 'TargetTemperature' characteristic for ${this.name}: ${e.message}`;
        if(optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
}

function addCurrentRelativeHumidityCharacteristic(service, optional) {
    try {
        let [currentHumidityItem, currentHumidityType] = this._getAndCheckItemType(CURRENT_TARGET_CLIMATE_CONFIG.currentHumidityItem, ['Number']);
        addCurrentStateCharacteristic.bind(this)(service,
            this.Characteristic.CurrentRelativeHumidity,
            currentHumidityItem,
            currentHumidityType,
            false,
            dummyTransformation
        );
    } catch(e) {
        let msg = `Not configuring 'CurrentRelativeHumidity' characteristic for ${this.name}: ${e.message}`;
        if(optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
}

function addTargetRelativeHumidityCharacteristic(service, optional) {
    try {
        let [targetHumidityItem, targetHumidityType] = this._getAndCheckItemType(CURRENT_TARGET_CLIMATE_CONFIG.targetHumidityItem, ['Number']);
        addTargetStateCharacteristic.bind(this)(service,
            this.Characteristic.TargetRelativeHumidity,
            targetHumidityItem,
            targetHumidityType,
            false,
            targetHumidityItem,
            targetHumidityType,
            false,
            dummyTransformation
        );
    } catch(e) {
        let msg = `Not configuring 'TargetRelativeHumidity' characteristic for ${this.name}: ${e.message}`;
        if(optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
}

function addTemperatureDisplayUnitsCharacteristic(service) {
    switch(this._config[CONFIG.tempUnit]) {
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
    let mode;

    if(!(heatingItem || coolingItem)) {
        throw new Error(`heatingItem and/or coolingItem need to be set: ${JSON.stringify(this._config)}`);
    } else {
        if(heatingItem) {
            mode = 'Heating';

            this._subscribeCharacteristic(service,
                this.Characteristic.CurrentHeatingCoolingState,
                heatingItem,
                transformHeatingCoolingState.bind(this,
                    heatingItem,
                    coolingItem,
                    heatingItem
                )
            );
        }
        if(coolingItem) {
            mode = mode === 'Heating' ? 'HeatingCooling' : 'Cooling'; // If heating device was present this means we have Heating Cooling

            this._subscribeCharacteristic(service,
                this.Characteristic.CurrentHeatingCoolingState,
                coolingItem,
                transformHeatingCoolingState.bind(this,
                    "cooling",
                    service.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState),
                )
            );
        }
    }

    service.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
        .on('get', _getHeatingCoolingState.bind(this, mode, heatingItem, coolingItem));



    thermostatService.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
        .on('get', _getHeatingCoolingState.bind(this, mode, heatingItem, coolingItem))
        .on('set', Accessory.setState(heatingItem, transformHeatingCoolingState, ))

    if(this._heatingItem) Accessory.setState.bind(this)(this._heatingItem, null, "OFF", function(){});
    if(this._coolingItem) Accessory.setState.bind(this)(this._coolingItem, null, "OFF", function(){});
}

function transformHeatingCoolingState(thisItemMode, characteristic, value) {
    let OFF = 0;
    let HEAT = 1;
    let COOL = 2;
    let AUTO = 3;

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
    } else if(mode === "cooling") {
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
    switch (mode) {
        case "Heating":
            getState.bind(this)(heatingItem, {
                "ON": this.Characteristic.CurrentHeatingCoolingState.HEAT,
                "OFF": this.Characteristic.CurrentHeatingCoolingState.OFF
            }, callback);
            break;
        case "Cooling":
            getState.bind(this, coolingItem, {
                "ON": this.Characteristic.CurrentHeatingCoolingState.COOL,
                "OFF": this.Characteristic.CurrentHeatingCoolingState.OFF
            }, callback);
            break;
        case "HeatingCooling":
            this._log.debug(`Getting heating/cooling state for ${this.name} [${this._heatingItem} & ${this._coolingItem}]`);
            let coolingState = this._openHAB.getStateSync(this._coolingItem);
            let heatingState = this._openHAB.getStateSync(this._heatingItem);
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

_setHeatingCoolingState(state, callback) {
    this._log(`Setting heating cooling state for ${this.name} [${this._heatingItem}] to ${state}`);
    switch(state) {
        case this.Characteristic.TargetHeatingCoolingState.OFF:
            break;
        case this.Characteristic.TargetHeatingCoolingState.HEAT:
            if(this._heatingItem) Accessory.setState.bind(this)(this._heatingItem, null, "ON", function(){});
            if(this._coolingItem) Accessory.setState.bind(this)(this._coolingItem, null, "OFF", function(){});
            if(this._mode === "Cooling") {
                this._services[1].setCharacteristic(this.Characteristic.CurrentHeatingCoolingState, this.Characteristic.CurrentHeatingCoolingState.OFF);
            }
            break;
        case this.Characteristic.TargetHeatingCoolingState.COOL:
            if(this._heatingItem) Accessory.setState.bind(this)(this._heatingItem, null, "OFF", function(){});
            if(this._coolingItem) Accessory.setState.bind(this)(this._coolingItem, null, "ON", function(){});
            if(this._mode === "Heating") {
                this._services[1].setCharacteristic(this.Characteristic.CurrentHeatingCoolingState, this.Characteristic.CurrentHeatingCoolingState.OFF);
            }
            break;
    }
    callback();
}







function dummyTransformation(_, _, value) {
    return value;
}






module.exports = {
    addCurrentStateCharacteristic,
    addTargetStateCharacteristic,
};

