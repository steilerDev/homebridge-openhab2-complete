'use strict';

const {Accessory} = require('../util/Accessory');
const {
    addHeatingCoolingStateCharacteristic,
    addTemperatureDisplayUnitsCharacteristic,
    addTargetRelativeHumidityCharacteristic,
    addCurrentRelativeHumidityCharacteristic,
    addTargetTemperatureCharacteristic,
    addCurrentTemperatureCharacteristic
} = require('./characteristic/CurrentTargetClimate');

class ThermostatAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Thermostat'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating thermostat service for ${this.name}`);
        let thermostatService = new this.Service.Thermostat(this.name);
        addCurrentTemperatureCharacteristic(thermostatService);
        addTargetTemperatureCharacteristic(thermostatService);
        addCurrentRelativeHumidityCharacteristic(thermostatService, true);
        addTargetRelativeHumidityCharacteristic(thermostatService, true);
        addHeatingCoolingStateCharacteristic(thermostatService);
        addTemperatureDisplayUnitsCharacteristic(thermostatService);
        return thermostatService;
    }

}

const type = "thermostat";

function createAccessory(platform, config) {
    return new ThermostatAccessory(platform, config);
}

module.exports = {createAccessory, type};
