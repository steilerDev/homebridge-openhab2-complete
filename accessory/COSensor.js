'use strict';

const {Accessory} = require('../util/Accessory');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');
const {addCarbonMonoxideLevelCharacteristic} = require('./characteristic/Level');
const {addCarbonMonoxideDetectedCharacteristic} = require('./characteristic/BinarySensor');

class COSensorAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);
        this._services.push([
            this._getAccessoryInformationService('Carbon Monoxide Sensor'),
            this._getPrimaryService()
        ]);
    }

    _getPrimaryService() {
        this._log.debug(`Creating carbon monoxide sensor service for ${this.name}`);
        let primaryService = new this.Service.CarbonMonoxideSensor(this.name);
        addCarbonMonoxideDetectedCharacteristic.bind(this)(primaryService);
        addCarbonMonoxideLevelCharacteristic.bind(this)(primaryService);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "co";

function createAccessory(platform, config) {
    return new COSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};

