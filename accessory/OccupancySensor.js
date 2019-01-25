'use strict';

const {BinarySensorAccessory} = require('./BinarySensor');
const {addBatteryWarningCharacteristic} = require('./characteristic/Battery');

class OccupancySensorAccessory extends BinarySensorAccessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Occupancy Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        let primaryService = this._configureBinaryService(
            new this.Service.OccupancySensor(this.name),
            this.Characteristic.OccupancyDetected
        );

        addBatteryWarningCharacteristic.bind(this)(primaryService);

        return primaryService;
    }
}

const type = "occupancy";

function createAccessory(platform, config) {
    return new OccupancySensorAccessory(platform, config);
}

module.exports = {createAccessory, type};
