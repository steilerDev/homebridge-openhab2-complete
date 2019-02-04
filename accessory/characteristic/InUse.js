'use strict';

const {getState} = require('../../util/Accessory');

const IN_USE_CONF = {
    item: "item",
    inverted: "inverted",
    inUseItem: "inUseItem",
    inUseItemInverted: "inUseItemInverted"
};

function addInUseCharacteristic(characteristic) {
    let item, itemType, inverted;
    if(this._config[IN_USE_CONF.inUseItem]) {
        [item, itemType] = this._getAndCheckItemType(IN_USE_CONF.inUseItem, ['Number', 'Switch', 'Contact']);
        inverted = this._checkInvertedConf(IN_USE_CONF.inUseItemInverted);
    } else {
        [item, itemType] = this._getAndCheckItemType(IN_USE_CONF.item, ['Switch']);
        inverted = this._checkInvertedConf(IN_USE_CONF.inverted);
    }
    this._log.debug(`Creating 'InUse' characteristic for ${this.name} with item ${item} and inverted set to ${inverted}`);

    let transformation;
    switch(itemType) {
        case "Switch":
            transformation = {
                "ON": + (!inverted), //Converting to number
                "OFF": + (inverted)
            };
            break;
        case "Contact":
            transformation = {
                "OPEN": + (!inverted),
                "CLOSED": + (inverted)
            };
            break;
        case "Number":
            transformation = function (value) {
                return + (parseFloat(value) > 0 && !inverted);
            };
    }

    characteristic.on('get', getState.bind(this,
            item,
            transformation
        ));
    this._subscribeCharacteristic(characteristic,
        item,
        transformation
    );
}

function addOutletInUseCharacteristic(service) {
    addInUseCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.OutletInUse));
}

module.exports = {addOutletInUseCharacteristic};