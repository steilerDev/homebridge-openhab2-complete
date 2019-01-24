'use strict';

import {NumericSensorAccessory} from './NumericSensor';
import {addBatteryWarningCharacteristic} from "./characteristic/Battery";

export class TemperatureSensorAccessory extends NumericSensorAccessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Temperature Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        let primaryService = this._configureNumericService(
            new this.Service.TemperatureSensor(this.name),
            this.Characteristic.CurrentTemperature
        );

        addBatteryWarningCharacteristic(this, primaryService);

        return primaryService;
    }
}
