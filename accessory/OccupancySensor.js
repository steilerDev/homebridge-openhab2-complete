'use strict';

const {Accessory} = require('../util/Accessory');
const {addOccupancyDetectedCharacteristic} = require('./characteristic/BinarySensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class OccupancySensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Occupancy Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating occupancy sensor service for ${this.name}`);
        let primaryService = new this.Service.OccupancySensor(this.name);
        addOccupancyDetectedCharacteristic.bind(this)(primaryService);
        addBatteryWarningCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "occupancy";

function createAccessory(platform, config) {
    return new OccupancySensorAccessory(platform, config);
}

module.exports = {createAccessory, type};
