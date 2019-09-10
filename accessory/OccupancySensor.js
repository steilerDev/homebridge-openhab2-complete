'use strict';

const {Accessory} = require('../util/Accessory');
const {addOccupancyDetectedCharacteristic} = require('./characteristic/Binary');

class OccupancySensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);
        this._services.unshift(this._getAccessoryInformationService('Occupancy Sensor'));
        this._services.push(this._getPrimaryService());
    }

    _getPrimaryService() {
        this._log.debug(`Creating occupancy sensor service for ${this.name}`);
        let primaryService = new this.Service.OccupancySensor(this.name);
        addOccupancyDetectedCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "occupancy";

function createAccessory(platform, config) {
    return new OccupancySensorAccessory(platform, config);
}

module.exports = {createAccessory, type};
