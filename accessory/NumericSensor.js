'use strict';

const Accessory = require('./Accessory');

const CONFIG = {
    item: "item"
};

class NumericSensorAccessory extends Accessory.Accessory {
    constructor(platform, config) {
        super(platform, config);

        if(!(this._config[CONFIG.item])) {
            throw new Error(`Required item not defined: ${JSON.stringify(this._config)}`)
        } else {
            this._item = this._config[CONFIG.item];
            this._getAndCheckItemType(this._item, ['Number']);
        }
    }

    _configureNumericService(numericSerivce, numericCharacteristic) {
        this._log.debug(`Creating numeric sensor service for ${this.name} [${this._item}]`);
        numericSerivce.getCharacteristic(numericCharacteristic)
            .on('get', Accessory.getState.bind(this, this._item, parseFloat));

        return numericSerivce;
    }
}

// Shows the loader, that this accessory should be ignored
const ignore = true;

module.exports = {NumericSensorAccessory, ignore};
