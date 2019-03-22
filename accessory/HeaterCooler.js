'use strict';

const {Accessory} = require('../util/Accessory');
const {addSwingModeCharacteristic, addActiveCharacteristic} = require('./characteristic/BinarySensor');
const {
    addRotationSpeedCharacteristic,
    addCurrentTemperatureCharacteristic,
    addHeatingThresholdCharacteristic,
    addCoolingThresholdCharacteristic,
    addTemperatureDisplayUnitsCharacteristic
} = require('./characteristic/Climate');
const {
    addCurrentHeaterCoolerStateCharacteristic,
    addTargetHeaterCoolerStateCharacteristic
} = require('./characteristic/ClimateHeaterCooler');



class HeaterCoolerAccessory extends Accessory {
    _getPrimaryService() {
        this._log.debug(`Creating Heater/Cooler service for ${this.name}`);
        let primaryService = new this.Service.HeaterCooler(this.name);
        addCurrentTemperatureCharacteristic.bind(this)(primaryService);
        addTargetHeaterCoolerStateCharacteristic.bind(this)(primaryService);
        addCurrentHeaterCoolerStateCharacteristic.bind(this)(primaryService);
        addActiveCharacteristic.bind(this)(primaryService);
        addHeatingThresholdCharacteristic.bind(this)(primaryService, true);
        addCoolingThresholdCharacteristic.bind(this)(primaryService, true);
        addRotationSpeedCharacteristic.bind(this)(primaryService, true);
        addSwingModeCharacteristic.bind(this)(primaryService, true);
        addTemperatureDisplayUnitsCharacteristic.bind(this)(primaryService, true);
        return primaryService;
    }
}

const type = "heatercooler";

function createAccessory(platform, config) {
    return new HeaterCoolerAccessory(platform, config, 'Heater/Cooler');
}

module.exports = {createAccessory, type};

