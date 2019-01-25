'use strict';

const {BinarySensorAccessory} = require('./BinarySensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');
const {addLevelCharacteristic} = require('./characteristic/Level');

class COSensorAccessory extends BinarySensorAccessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Carbon Monoxide Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        let primaryService = this._configureBinaryService(
            new this.Service.CarbonMonoxideSensor(this.name),
            this.Characteristic.CarbonMonoxideDetected
        );

        addBatteryWarningCharacteristic.bind(this)(primaryService);
        addLevelCharacteristic.bind(this)(primaryService, this.Characteristic.CarbonMonoxideLevel);
        return primaryService;
    }
}

const type = "co";

function createAccessory(platform, config) {
    return new COSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};

