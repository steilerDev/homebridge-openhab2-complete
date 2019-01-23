'use strict';

const Accessory = require('./Accessory');

const CONFIG = {
    habItem: "habItem"
}

class TemperatureSensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);

        if(!(this._config[CONFIG.habItem])) {
            throw new Error(`Required habItem not defined: ${JSON.stringify(this._config)}`)
        } else {
            this._habItem = this._config[CONFIG.habItem];
            this._getAndCheckItemType(this._habItem, ['Number']);
        }

        this._configureBattery();

        this._services = [
            this._getAccessoryInformationService('Temperature Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating temperature sensor service for ${this.name} [${this._habItem}]`);
        let tempService = new this.Service.TemperatureSensor(this.name);
        tempService.getCharacteristic(this.Characteristic.CurrentTemperature)
            .on('get', this._getRawState.bind(this, this._habItem));

        if(this._habBatteryItem) {
            tempService.getCharacteristic(this.Characteristic.StatusLowBattery)
                .on('get', this._getBatteryState.bind(this))
        }

        return tempService;
    }
}

module.exports = TemperatureSensorAccessory;