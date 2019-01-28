'use strict';

const {Accessory} = require('../util/Accessory');
const {addBinarySensorCharacteristic} = require('./characteristic/BinarySensor');
const {addLevelCharacteristic} = require('./characteristic/Level');

class FilterMaintenanceSensorAccessory extends BinarySensorAccessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Filter Maintenance Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating filter maintenance service for ${this.name}`);
        let primaryService = new this.Service.FilterMaintenance(this.name);
        addBinarySensorCharacteristic.bind(this)(primaryService, this.Characteristic.FilterChangeIndication)
        addLevelCharacteristic.bind(this)(primaryService, this.Characteristic.FilterLifeLevel);
        return primaryService;
    }
}

const type = "filter";

function createAccessory(platform, config) {
    return new FilterMaintenanceSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};
