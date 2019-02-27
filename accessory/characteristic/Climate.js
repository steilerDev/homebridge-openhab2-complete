'use strict';

const {addNumericSensorCharacteristic, addNumericSensorActorCharacteristic} = require('./Numeric');

const CLIMATE_CONFIG = {
    waterLevelItem: "waterLevelItem",
    rotationSpeedItem: "rotationSpeedItem",
    currentHumidityItem: "currentHumidityItem",
    targetHumidityItem: "targetHumidityItem",
    currentTempItem: "currentTempItem",
    targetTempItem: "targetTempItem",
    heatingThresholdTempItem: "heatingThresholdTempItem",
    coolingThresholdTempItem: "coolingThresholdTempItem",
    dehumidifierThresholdItem: "dehumidifierThresholdItem",
    humidifierThresholdItem: "humidifierThresholdItem",
    tempUnit: "tempUnit", // 'Celsius' (default), 'Fahrenheit'
};

function addWaterLevelCharacteristic(service, optional) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.WaterLevel), {item: CLIMATE_CONFIG.waterLevelItem}, optional);
}

function addRotationSpeedCharacteristic(service, optional) {
    addNumericSensorActorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.RotationSpeed), {item: CLIMATE_CONFIG.rotationSpeedItem}, optional);
}

function addCurrentRelativeHumidityCharacteristic(service, optional) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity), {item: CLIMATE_CONFIG.currentHumidityItem}, optional);
}

function addTargetRelativeHumidityCharacteristic(service, optional) {
    addNumericSensorActorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.TargetRelativeHumidity), {item: CLIMATE_CONFIG.targetHumidityItem}, optional);
}

function addCurrentTemperatureCharacteristic(service, optional) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CurrentTemperature), {item: CLIMATE_CONFIG.currentTempItem}, optional);
}

function addTargetTemperatureCharacteristic(service, optional) {
    addNumericSensorActorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.TargetTemperature), {item: CLIMATE_CONFIG.targetTempItem}, optional);
}

function addCoolingThresholdCharacteristic(service, optional) {
    addNumericSensorActorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CoolingThresholdTemperature), {item: CLIMATE_CONFIG.coolingThresholdTempItem}, optional);
}

function addHeatingThresholdCharacteristic(service, optional) {
    addNumericSensorActorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.HeatingThresholdTemperature), {item: CLIMATE_CONFIG.heatingThresholdTempItem}, optional);
}

function addRelativeHumidityDehumidifierThresholdCharacteristic(service, optional) {
    addNumericSensorActorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.RelativeHumidityDehumidifierThreshold), {item: CLIMATE_CONFIG.dehumidifierThresholdItem}, optional);
}

function addRelativeHumidityHumidifierThresholdCharacteristic(service, optional) {
    addNumericSensorActorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.RelativeHumidityHumidifierThreshold), {item: CLIMATE_CONFIG.humidifierThresholdItem}, optional);
}

function addTemperatureDisplayUnitsCharacteristic(service) {
    switch (this._config[CLIMATE_CONFIG.tempUnit]) {
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

module.exports = {
    addWaterLevelCharacteristic,
    addRotationSpeedCharacteristic,
    addCurrentRelativeHumidityCharacteristic,
    addCurrentTemperatureCharacteristic,
    addCoolingThresholdCharacteristic,
    addHeatingThresholdCharacteristic,
    addTemperatureDisplayUnitsCharacteristic,
    addTargetRelativeHumidityCharacteristic,
    addTargetTemperatureCharacteristic,
    addRelativeHumidityDehumidifierThresholdCharacteristic,
    addRelativeHumidityHumidifierThresholdCharacteristic
};