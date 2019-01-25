'use strict';

const {getState} = require('../Accessory');

const LEVEL_CONFIG = {
    levelItem: "levelItem"
};

// This function will try and add a level characteristic for numeric levels on binary sensors (e.g. CO level) to the provided service
function addLevelCharacteristic(service, characteristic) {
    try {
        if (this._config[LEVEL_CONFIG.levelItem]) {
            let levelItem = this._config[LEVEL_CONFIG.levelItem];
            this._getAndCheckItemType(levelItem, ['Number']);

            service.getCharacteristic(characteristic)
                .on('get', getState.bind(this, levelItem, null));
        }
    } catch (e) {
        this._log.error(`Not configuring level characteristic for ${this.name}: ${e.message}`);
    }
}

module.exports = {addLevelCharacteristic};
