'use strict';

const Accessory = require('./Accessory').Accessory;
const getState = require('./Accessory').getState;

const CONFIG = {
    habItem: "habItem"
};

class NumericSensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);

        if(!(this._config[CONFIG.habItem])) {
            throw new Error(`Required habItem not defined: ${JSON.stringify(this._config)}`)
        } else {
            this._habItem = this._config[CONFIG.habItem];
            this._getAndCheckItemType(this._habItem, ['Number']);
        }

        let configureBattery = require('./Accessory').configureBattery.bind(this);
        configureBattery();
    }

    _configureNumericService(numericSerivce, numericCharacteristic) {
        this._log.debug(`Creating numeric sensor service for ${this.name} [${this._habItem}]`);
        numericSerivce.getCharacteristic(numericCharacteristic)
            .on('get', getState.bind(this, this._habItem, _));

        if(this._habBatteryItem) {
            numericSerivce.getCharacteristic(this.Characteristic.StatusLowBattery)
                .on('get', getState.bind(this, this._habBatteryItem, {
                    [this._habBatteryItemStateWarning] : 1,
                    "_default": 0
            }))
        }

        return numericSerivce;
    }
}

module.exports = NumericSensorAccessory;