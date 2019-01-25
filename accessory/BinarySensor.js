'use strict';

const Accessory = require('./Accessory');

const CONFIG = {
    item: "item",
    inverted: "inverted"
};

class BinarySensorAccessory extends Accessory.Accessory {
    constructor(platform, config) {
        super(platform, config);

        if(!(this._config[CONFIG.item])) {
            throw new Error(`Required item not defined: ${JSON.stringify(this._config)}`)
        } else {
            this._item = this._config[CONFIG.item];
            this._type = this._getAndCheckItemType(this._item, ['Contact', 'Switch']);
        }

        let inverted = false;
        if(this._config[CONFIG.inverted] && (this._config[CONFIG.inverted] === "false" || this._config[CONFIG.inverted] === "true")) {
            inverted = this._config[CONFIG.inverted] === "true";
        }

        this._transformation = inverted ? {
            "OFF": true,
            "ON": false,
            "CLOSED": true,
            "OPEN": false
        } : {
            "OFF": false,
            "ON": true,
            "CLOSED": false,
            "OPEN": true
        };
    }

    _configureBinaryService(binaryService, binaryCharacteristic, transformation) {
        this._log.debug(`Creating binary sensor service for ${this.name} [${this._habItem}]`);
        binaryService.getCharacteristic(binaryCharacteristic)
            .on('get', Accessory.getState.bind(this, this._item, transformation || this._transformation));

        return binaryService;
    }
}

module.exports = {BinarySensorAccessory};
