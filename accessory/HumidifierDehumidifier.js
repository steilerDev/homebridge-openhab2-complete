'use strict';

const {Accessory} = require('../util/Accessory');
const {addSwingModeCharacteristic, addActiveCharacteristic} = require('./characteristic/BinarySensor');
const {
    addWaterLevelCharacteristic,
    addRotationSpeedCharacteristic,
    addCurrentRelativeHumidityCharacteristic,
    addRelativeHumidityHumidifierThresholdCharacteristic,
    addRelativeHumidityDehumidifierThresholdCharacteristic
} = require('./characteristic/Climate');
const {
    addCurrentHumidifierDehumidifierStateCharacteristic,
    addTargetHumidifierDehumidifierStateCharacteristic
} = require('./characteristic/ClimateDeHumidifier');

class HumidifierDehumidifierAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);
        this._services.push([
            this._getAccessoryInformationService('Humidifier/Dehumidifier'),
            this._getPrimaryService()
        ]);
    }

    _getPrimaryService() {
        this._log.debug(`Creating Humidifier/Dehumidifier service for ${this.name}`);
        let primaryService = new this.Service.HumidifierDehumidifier(this.name);
        addCurrentRelativeHumidityCharacteristic.bind(this)(primaryService);
        addCurrentHumidifierDehumidifierStateCharacteristic.bind(this)(primaryService);
        addTargetHumidifierDehumidifierStateCharacteristic.bind(this)(primaryService);
        addActiveCharacteristic.bind(this)(primaryService);
        addRelativeHumidityHumidifierThresholdCharacteristic.bind(this)(primaryService, true);
        addRelativeHumidityDehumidifierThresholdCharacteristic.bind(this)(primaryService, true);
        addWaterLevelCharacteristic.bind(this)(primaryService, true);
        addRotationSpeedCharacteristic.bind(this)(primaryService, true);
        addSwingModeCharacteristic.bind(this)(primaryService, true);
        return primaryService;
    }
}

const type = "humidifier";

function createAccessory(platform, config) {
    return new HumidifierDehumidifierAccessory(platform, config);
}

module.exports = {createAccessory, type};

