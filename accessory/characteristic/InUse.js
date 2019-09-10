'use strict';

const {getState} = require('../../util/Util');

const IN_USE_CONF = {
    item: "item",
    inverted: "inverted",
    inUseItem: "inUseItem",
    inUseItemInverted: "inUseItemInverted"
};

function addGenericInUseCharacteristic(service, characteristic, optional) {
    try {
        let item, itemType, inverted;
        if (this._config[IN_USE_CONF.inUseItem]) {
            [item, itemType] = this._getAndCheckItemType(IN_USE_CONF.inUseItem, ['Number', 'Switch', 'Contact']);
            inverted = this._checkInvertedConf(IN_USE_CONF.inUseItemInverted);
        } else {
            [item, itemType] = this._getAndCheckItemType(IN_USE_CONF.item, ['Switch']);
            inverted = this._checkInvertedConf(IN_USE_CONF.inverted);
        }
        this._log.debug(`Creating 'InUse' characteristic for ${this.name} with item ${item} and inverted set to ${inverted}`);

        let transformation;
        switch (itemType) {
            case "Switch":
                transformation = {
                    "ON": +(!inverted), //Converting to number
                    "OFF": +(inverted)
                };
                break;
            case "Contact":
                transformation = {
                    "OPEN": +(!inverted),
                    "CLOSED": +(inverted)
                };
                break;
            case "Number":
                transformation = function (value) {
                    return +(parseFloat(value) > 0 && !inverted);
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
    } catch(e) {
        let msg = `Not configuring 'InUse' characteristic for ${this.name}: ${e.message}`;
        service.removeCharacteristic(characteristic);
        if(optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
}

function addOutletInUseCharacteristic(service) {
    addGenericInUseCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.OutletInUse));
}

function addInUseCharacteristic(service) {
    addGenericInUseCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.InUse))
}

module.exports = {addOutletInUseCharacteristic, addInUseCharacteristic};