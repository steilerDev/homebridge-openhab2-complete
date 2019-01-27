'use strict';

const {BinarySensorAccessory} = require('./BinarySensor');
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
        let primaryService = this._configureBinaryService(
            new this.Service.FilterMaintenance(this.name),
            this.Characteristic.FilterChangeIndication
        );

        addBatteryWarningCharacteristic.bind(this)(primaryService);
        addLevelCharacteristic.bind(this)(primaryService, this.Characteristic.FilterLifeLevel);
        return primaryService;
    }
}

const type = "filter";

function createAccessory(platform, config) {
    return new FilterMaintenanceSensorAccessory(platform, config);
}

module.exports = {createAccessory, type};
