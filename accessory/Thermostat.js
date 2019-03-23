'use strict';

const {Accessory} = require('../util/Accessory');
const {
    addCurrentRelativeHumidityCharacteristic,
    addCurrentTemperatureCharacteristic,
    addHeatingThresholdCharacteristic,
    addCoolingThresholdCharacteristic,
    addTemperatureDisplayUnitsCharacteristic,
    addTargetRelativeHumidityCharacteristic,
    addTargetTemperatureCharacteristic
} = require('./characteristic/Climate');
const {
    addCurrentHeatingCoolingStateCharacteristic,
    addTargetHeatingCoolingStateCharacteristic
} = require('./characteristic/ClimateThermostat');

class ThermostatAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);
        this._services.push([
            this._getAccessoryInformationService('Thermostat'),
            this._getPrimaryService()
        ]);
    }

    _getPrimaryService() {
        this._log.debug(`Creating thermostat service for ${this.name}`);
        let primaryService = new this.Service.Thermostat(this.name);
        addCurrentTemperatureCharacteristic.bind(this)(primaryService);
        addTargetTemperatureCharacteristic.bind(this)(primaryService);
        addCurrentRelativeHumidityCharacteristic.bind(this)(primaryService, true);
        addTargetRelativeHumidityCharacteristic.bind(this)(primaryService, true);
        addTargetHeatingCoolingStateCharacteristic.bind(this)(primaryService);
        addCurrentHeatingCoolingStateCharacteristic.bind(this)(primaryService);
        addTemperatureDisplayUnitsCharacteristic.bind(this)(primaryService);
        addCoolingThresholdCharacteristic.bind(this)(primaryService, true);
        addHeatingThresholdCharacteristic.bind(this)(primaryService, true);
        return primaryService;
    }

}

const type = "thermostat";

function createAccessory(platform, config) {
    return new ThermostatAccessory(platform, config);
}

module.exports = {createAccessory, type};
