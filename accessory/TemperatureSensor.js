'use strict';

const Accessory = require('./Accessory');

class TemperatureSensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);

        if(!(this._config["habItem"])) {
            throw new Error(`Required habItem not defined: ${JSON.stringify(this._config)}`)
        } else {
            this._habItem = this._config["habItem"];
        }

        this._getAndCheckItemType(this._habItem, ['Number']);

        this._services = [
            this._getAccessoryInformationService('Temperature Sensor'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating temperature sensor service for ${this.name} [${this._habItem}]`);
        let tempService = new this.Service.TemperatureSensor(this.name);
        tempService.getCharacteristic(this.Characteristic.CurrentTemperature)
            .on('get', this._getState.bind(this));

        return tempService;
    }

    _getState(callback) {
        this._log(`Getting state for ${this.name} [${this._habItem}]`);
        this._openHAB.getState(this._habItem, function(error, state) {
            if(error) {
                this._log.error(`Unable to get state: ${error.message}`);
                callback(error);
            } else {
                this._log(`Received state: ${state} for ${this.name} [${this._habItem}]`);
                callback(null, state);
            }
        }.bind(this));
    }
}

module.exports = TemperatureSensorAccessory;