'use strict';

const {Accessory} = require('../util/Accessory');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');
const {addCarbonDioxideLevelCharacteristic} = require('./characteristic/Level');
const {addCarbonDioxideDetectedCharacteristic} = require('./characteristic/BinarySensor');

class CO2SensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);
        this._services.push([
            this._getAccessoryInformationService('Carbon Dioxide Sensor'),
            this._getPrimaryService()
        ]);
    }

    _getPrimaryService() {
        this._log.debug(`Creating carbon dioxide sensor service for ${this.name}`);
        let primaryService = new this.Service.CarbonDioxideSensor(this.name);
        addCarbonDioxideDetectedCharacteristic.bind(this)(primaryService);
        addCarbonDioxideLevelCharacteristic.bind(this)(primaryService);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "co2";

function createAccessory(platform, config) {
    return new CO2SensorAccessory(platform, config);
}

module.exports = {createAccessory, type};
