'use strict';

const {getState, setState} = require('../../util/Accessory');

const ON_CONFIG = {
    item: "item",
    inverted: "inverted"
};

function addOnCharacteristic(service, optional) {
    try {
        let [item] = this._getAndCheckItemType(ON_CONFIG.item, ['Switch']);
        let inverted = this._checkInvertedConf(ON_CONFIG.inverted);

        this._log.debug(`Creating 'ON' characteristic for ${this.name} with item ${item} and inverted set to ${inverted}`);

        let transformation = {
            "OFF": inverted,
            "ON": !inverted,
            [!inverted]: "ON",
            [inverted]: "OFF"
        };

        service.getCharacteristic(this.Characteristic.On)
            .on('set', setState.bind(this,
                item,
                transformation
            ))
            .on('get', getState.bind(this,
                item,
                transformation
            ));

        this._subscribeCharacteristic(service.getCharacteristic(this.Characteristic.On),
            item,
            transformation
        );
    } catch(e) {
        let msg = `Not configuring 'ON' characteristic for ${this.name}: ${e.message}`;
        if(optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
}

module.exports = {addOnCharacteristic};
