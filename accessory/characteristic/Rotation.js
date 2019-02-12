'use strict';

const {setState, getState, dummyTransformation} = require('../../util/Accessory');

const ROTATION_CONF = {
    rotationSpeedItem: "rotationSpeedItem",
    rotationDirectionItem: "rotationDirectionItem"
};

function addRotationSpeedCharacteristic(service, optional) {
    try {
        let characteristic = service.getCharacteristic(this.Characteristic.RotationSpeed);
        let [item] = this._getAndCheckItemType(ROTATION_CONF.rotationSpeedItem, ['Number']);

        this._log.debug(`Creating 'RotationSpeed' characteristic for ${this.name} with item ${item}`);

        characteristic.on('get', getState.bind(this,
            item,
            dummyTransformation
        ))
        .on('set', setState.bind(this,
            item,
            dummyTransformation
        ));

        this._subscribeCharacteristic(characteristic,
            item,
            dummyTransformation
        );

    } catch(e) {
        let msg = `Not configuring 'RotationSpeed' characteristic for ${this.name}: ${e.message}`;
        if(optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }

}

module.exports = {addRotationSpeedCharacteristic};