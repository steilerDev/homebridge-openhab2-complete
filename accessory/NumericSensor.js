'use strict';

const Accessory = require('./Accessory');

const CONFIG = {
    habItem: "habItem"
};

class NumericSensorAccessory extends Accessory.Accessory {
    constructor(platform, config) {
        super(platform, config);

        if(!(this._config[CONFIG.habItem])) {
            throw new Error(`Required habItem not defined: ${JSON.stringify(this._config)}`)
        } else {
            this._habItem = this._config[CONFIG.habItem];
            this._getAndCheckItemType(this._habItem, ['Number']);
        }
    }

    _configureNumericService(numericSerivce, numericCharacteristic) {
        this._log.debug(`Creating numeric sensor service for ${this.name} [${this._habItem}]`);
        numericSerivce.getCharacteristic(numericCharacteristic)
            .on('get', Accessory.getState.bind(this, this._habItem, null));

        return numericSerivce;
    }
}

module.exports = {NumericSensorAccessory};
