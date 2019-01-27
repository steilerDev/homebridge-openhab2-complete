'use strict';

const Accessory = require('./Accessory');

const CONFIG = {
    item: "item",
    inverted: "inverted"
};

class BinarySensorAccessory extends Accessory.Accessory {
    constructor(platform, config) {
        super(platform, config);

        [this._item, this._type] = this._getAndCheckItemType(CONFIG.item, ['Contact', 'Switch']);
        let inverted = Accessory.checkInvertedConf(this._config, CONFIG.inverted);

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

    _configureBinaryService(binaryService, binaryCharacteristic) {
        this._log.debug(`Creating binary sensor service for ${this.name} [${this._item}]`);
        binaryService.getCharacteristic(binaryCharacteristic)
            .on('get', Accessory.getState.bind(this,
                this._item,
                this._transformation
            ));

        this._subscribeCharacteristic(binaryService,
            binaryCharacteristic,
            this._item,
            this._transformation
        );

        return binaryService;
    }
}

// Shows the loader, that this accessory should be ignored
const ignore = true;

module.exports = {BinarySensorAccessory, ignore};
