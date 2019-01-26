'use strict';

const {Accessory} = require('./Accessory');
const {addOnCharacteristic} = require('./characteristic/On');

const CONFIG = {
    item: "item"
};

class BinaryAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);

        if(!(this._config[CONFIG.item])) {
            throw new Error(`Required item not defined: ${JSON.stringify(this._config)}`)
        } else {
            this._item = this._config[CONFIG.item];
        }

        // This will throw an error, if the item does not match the array.
        this._getAndCheckItemType(this._item, ['Switch']);
    }

    _configureOnCharacteristic(binaryService) {
        binaryService.getCharacteristic(this.Characteristic.On)
            .on('set', setState.bind(this, item, {
                true: "ON",
                false: "OFF"
            }))
            .on('get', getState.bind(this, item, {
                "ON": true,
                "OFF": false
            }));
        return binaryService;
    }
}

const ignore = true;

module.exports = {BinaryAccessory, ignore};
