'use strict';

const {getState} = require('../../util/Accessory');

const BINARY_CONFIG = {
    item: "item",
    inverted: "inverted"
};

// This function will try and add a battery warning characteristic to the provided service
function addBinarySensorCharacteristic(service, characteristic, optional) {
    try {
        let [item] = this._getAndCheckItemType(BINARY_CONFIG.item, ['Contact', 'Switch']);
        let inverted = this._checkInvertedConf(BINARY_CONFIG.inverted);

        this._log.debug(`Creating binary sensor characteristic for ${this.name} with item ${item} and inverted set to ${inverted}`);

        let transformation = {
            "OFF": inverted,
            "ON": !inverted,
            "CLOSED": inverted,
            "OPEN": !inverted
        };

        service.getCharacteristic(characteristic)
            .on('get', getState.bind(this,
                item,
                transformation
            ));

        this._subscribeCharacteristic(service,
            characteristic,
            item,
            transformation
        );
    } catch (e) {
        let msg = `Not configuring binary sensor characteristic for ${this.name}: ${e.message}`;
        if(optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
}

module.exports = {addBinarySensorCharacteristic};
