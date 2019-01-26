'use strict';

const Accessory = require('./Accessory');

const CONFIG = {
    currentTempItem: "currentTempItem", //required
    targetTempItem: "targetTempItem", //required
    currentHumidityItem: "currentHumidityItem",
    targetHumidityItem: "targetHumidityItem",
    heatingItem: "heatingItem", //State mutual Exclusive with coolingItem, 'Switch' type
    coolingItem: "coolingItem", //State mutual Exclusive with heatingItem, 'Switch' type
    tempUnit: "tempUnit" // 'Celsius' (default), 'Fahrenheit'
};

class ThermostatAccessory extends Accessory.Accessory {

    constructor(platform, config) {
        super(platform, config);

        if(!(this._config[CONFIG.currentTempItem] && this._config[CONFIG.targetTempItem])) {
            throw new Error(`Required habItem not defined: ${JSON.stringify(this._config)}`)
        }

        this._currentTempItem = this._config[CONFIG.currentTempItem];
        this._getAndCheckItemType(this._currentTempItem, ['Number']);

        this._targetTempItem = this._config[CONFIG.targetTempItem];
        this._getAndCheckItemType(this._targetTempItem, ['Number']);

        if(this._config[CONFIG.currentHumidityItem]) {
            this._currentHumidityItem = this._config[CONFIG.currentHumidityItem];
            this._getAndCheckItemType(this._currentHumidityItem, ['Number']);
        }

        if(this._config[CONFIG.targetHumidityItem]) {
            this._targetHumidityItem = this._config[CONFIG.targetHumidityItem];
            this._getAndCheckItemType(this._targetHumidityItem, ['Number']);
        }

        if(!(this._config[CONFIG.heatingItem] || this._config[CONFIG.coolingItem])) {
            throw new Error(`heatingItem and/or coolingItem need to be set: ${JSON.stringify(this._config)}`);
        } else {
            if(this._config[CONFIG.heatingItem]) {
                this._mode = 'Heating';
                this._heatingItem = this._config[CONFIG.heatingItem];
                this._getAndCheckItemType(this._heatingItem, ['Switch', 'Contact']);
            }
            if(this._config[CONFIG.coolingItem]) {
                this._mode = this._mode === 'Heating' ? 'HeatingCooling' : 'Cooling'; // If heating device was present this means we have Heating Cooling
                this._coolingItem = this._config[CONFIG.coolingItem];
                this._getAndCheckItemType(this._coolingItem, ['Switch', 'Contact']);
            }
        }

        switch(this._config[CONFIG.tempUnit]) {
            default:
            case 'Celsius':
                this._tempUnit = this.Characteristic.TemperatureDisplayUnits.CELSIUS;
                break;
            case 'Fahrenheit':
                this._tempUnit = this.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
                break;
        }

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Thermostat'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating thermostat service for ${this.name}`);
        let thermostatService = new this.Service.Thermostat(this.name);

        thermostatService.getCharacteristic(this.Characteristic.CurrentTemperature)
            .on('get', Accessory.getState.bind(this, this._currentTempItem, null));

        thermostatService.getCharacteristic(this.Characteristic.TargetTemperature)
            .on('get', Accessory.getState.bind(this, this._targetTempItem, null))
            .on('set', Accessory.setState.bind(this, this._targetTempItem, null));

        thermostatService.getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
            .on('get', function(callback) { callback(null, this._tempUnit) }.bind(this))
            .on('set', function(_, callback) { callback() }.bind(this));

        thermostatService.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
            .on('get', this._getHeatingCoolingState.bind(this));

        thermostatService.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
            .on('get', this._getHeatingCoolingState.bind(this))
            .on('set', this._setHeatingCoolingState.bind(this));

        if(this._currentHumidityItem) {
            thermostatService.getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
                .on('get', Accessory.getState.bind(this, this._currentHumidityItem, null));
        }

        if(this._targetHumidityItem) {
            thermostatService.getCharacteristic(this.Characteristic.TargetRelativeHumidity)
                .on('get', Accessory.getState.bind(this, this._targetHumidityItem, null))
                .on('set', Accessory.setState.bind(this, this._targetHumidityItem, null));
        }

        return thermostatService;
    }

    _getHeatingCoolingState(callback) {
        if(this._mode === "Heating") {
            this._log.debug(`Getting heating state for ${this.name} [${this._heatingItem}]`);
            Accessory.getState.bind(this)(this._heatingItem, {
                "ON": this.Characteristic.CurrentHeatingCoolingState.HEAT,
                "OFF": this.Characteristic.CurrentHeatingCoolingState.OFF
            }, callback);
        } else if(this._mode === "Cooling") {
            Accessory.getState.bind(this, this._coolingItem, {
                "ON": this.Characteristic.CurrentHeatingCoolingState.COOL,
                "OFF": this.Characteristic.CurrentHeatingCoolingState.OFF
            }, callback);
        } else if(this._mode === "HeatingCooling") {
            this._log.debug(`Getting heating/cooling state for ${this.name} [${this._heatingItem} & ${this._coolingItem}]`);
            let coolingState = this._openHAB.getStateSync(this._coolingItem);
            let heatingState = this._openHAB.getStateSync(this._heatingItem);
            if(coolingState instanceof Error) {
                callback(coolingState);
            }
            if(heatingState instanceof Error) {
                callback(heatingState);
            }

            if(heatingState === "OFF" && coolingState === "OFF") {
                callback(null, this.Characteristic.CurrentHeatingCoolingState.OFF);
            } else if(heatingState === "ON" && coolingState === "OFF") {
                callback(null, this.Characteristic.CurrentHeatingCoolingState.HEAT);
            } else if(heatingState === "OFF" && coolingState === "ON") {
                callback(null, this.Characteristic.CurrentHeatingCoolingState.COOL);
            } else {
                let msg = `Combination of heating state (${heatingState}) and cooling state (${coolingState}) not allowed!`;
                this._log.error(msg);
                callback(new Error(msg));
            }
        } else {
            let msg = `Unable to get HeatingCooling state for mode ${this._mode}`;
            this._log.error(msg);
            callback(new Error(msg));
        }
    }

    _setHeatingCoolingState(state, callback) {
        this._log(`Setting heating cooling state for ${this.name} [${this._heatingItem}] to ${state}`);
        switch(state) {
            case this.Characteristic.TargetHeatingCoolingState.OFF:
                if(this._heatingItem) Accessory.setState.bind(this)(this._heatingItem, null, "OFF", function(){});
                if(this._coolingItem) Accessory.setState.bind(this)(this._coolingItem, null, "OFF", function(){});
                break;
            case this.Characteristic.TargetHeatingCoolingState.HEAT:
                if(this._heatingItem) Accessory.setState.bind(this)(this._heatingItem, null, "ON", function(){});
                if(this._coolingItem) Accessory.setState.bind(this)(this._coolingItem, null, "OFF", function(){});
                if(this._mode === "Cooling") {
                    this._services[1].setCharacteristic(this.Characteristic.CurrentHeatingCoolingState, Characteristic.CurrentHeatingCoolingState.OFF);
                }
                break;
            case this.Characteristic.TargetHeatingCoolingState.COOL:
                if(this._heatingItem) Accessory.setState.bind(this)(this._heatingItem, null, "OFF", function(){});
                if(this._coolingItem) Accessory.setState.bind(this)(this._coolingItem, null, "ON", function(){});
                if(this._mode === "Heating") {
                    this._services[1].setCharacteristic(this.Characteristic.CurrentHeatingCoolingState, Characteristic.CurrentHeatingCoolingState.OFF);
                }
                break;
        }
        callback();
    }
}

const type = "thermostat";

function createAccessory(platform, config) {
    return new ThermostatAccessory(platform, config);
}

module.exports = {createAccessory, type};
