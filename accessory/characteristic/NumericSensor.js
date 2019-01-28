'use strict';

const {getState} = require('../../util/Accessory');

const NUMERIC_CONFIG = {
    item: "item"
};

function addNumericSensorCharacteristic(service, characteristic) {
    let [item] = this._getAndCheckItemType(NUMERIC_CONFIG.item, ['Number']);

    this._log.debug(`Creating numeric sensor service for ${this.name} with ${item}`);

    service.getCharacteristic(characteristic)
        .on('get', getState.bind(this,
            item,
            parseFloat
        ));

    this._subscribeCharacteristic(service,
        characteristic,
        item,
        parseFloat
    );
}

module.exports = {addNumericSensorCharacteristic};
