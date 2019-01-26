'use strict';

const Accessory = require('./Accessory');

const CONFIG = {
    item: "item"
};

class NumericSensorAccessory extends Accessory.Accessory {
    constructor(platform, config) {
        super(platform, config);

        [this._item] = this._getAndCheckItemType(CONFIG.item, ['Number']);
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
