'use strict';

const Accessory = require('./Accessory');

const CONFIG = {
    item: "item"
};

class BinaryActorAccessory extends Accessory.Accessory {

    constructor(platform, config) {
        super(platform, config);

        [this._item] = this._getAndCheckItemType(CONFIG.item, ['Switch']);
    }

    _configureOnCharacteristic(binaryService) {
        binaryService.getCharacteristic(this.Characteristic.On)
            .on('set', Accessory.setState.bind(this, this._item, {
                true: "ON",
                false: "OFF"
            }))
            .on('get', Accessory.getState.bind(this, this._item, {
                "ON": true,
                "OFF": false
            }));
        return binaryService;
    }
}

const ignore = true;

module.exports = {BinaryActorAccessory, ignore};
