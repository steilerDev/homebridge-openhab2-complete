'use strict';

const {BinarySensorAccessory} = require('./BinarySensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');
const {addLevelCharacteristic} = require('./characteristic/Level');

class CO2SensorAccessory extends BinarySensorAccessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Carbon Dioxide Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        let primaryService = this._configureBinaryService(
            new this.Service.CarbonDioxideSensor(this.name),
            this.Characteristic.CarbonDioxideDetected
        );

        addBatteryWarningCharacteristic.bind(this)(primaryService);
        addLevelCharacteristic.bind(this)(primaryService, this.Characteristic.CarbonDioxideLevel);
        return primaryService;
    }
}

const type = "co2";

function createAccessory(platform, config) {
    return new CO2SensorAccessory(platform, config);
}

module.exports = {createAccessory, type};
