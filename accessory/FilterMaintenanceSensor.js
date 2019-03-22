'use strict';

const {Accessory} = require('../util/Accessory');
const {addFilterChangeIndicationCharacteristic} = require('./characteristic/BinarySensor');
const {addFilterLifeLevelCharacteristic} = require('./characteristic/Level');

class FilterMaintenanceSensorAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config, 'Filter Maintenance Sensor');
    }

    _getPrimaryService() {
        this._log.debug(`Creating filter maintenance service for ${this.name}`);
        let primaryService = new this.Service.FilterMaintenance(this.name);
        addFilterChangeIndicationCharacteristic.bind(this)(primaryService);
        addFilterLifeLevelCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "filter";

function createAccessory(platform, config) {
    return new FilterMaintenanceSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};
