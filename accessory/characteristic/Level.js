'use strict';

const {getState} = require('../../util/Accessory');

const LEVEL_CONFIG = {
    levelItem: "levelItem"
};

// This function will try and add a level characteristic for numeric levels on binary sensors (e.g. CO level) to the provided service
function addLevelCharacteristic(service, characteristic) {
    try {
        let [levelItem] = this._getAndCheckItemType(LEVEL_CONFIG.levelItem, ['Number']);

        this._log.debug(`Creating level characteristic for ${this.name} with item ${levelItem}`);

        characteristic.on('get', getState.bind(this,
                levelItem,
                parseInt));

        this._subscribeCharacteristic(characteristic,
            levelItem,
            parseInt
        );
    } catch (e) {
        this._log.debug(`Not configuring level characteristic for ${this.name}: ${e.message}`);
        service.removeCharacteristic(characteristic);
    }
}

function addCarbonDioxideLevelCharacteristic(service) {
    addLevelCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CarbonDioxideLevel));
}

function addCarbonMonoxideLevelCharacteristic(service) {
    addLevelCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CarbonMonoxideLevel));
}

function addFilterLifeLevelCharacteristic(service) {
    addLevelCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.FilterLifeLevel));
}
module.exports = {
    addCarbonDioxideLevelCharacteristic,
    addCarbonMonoxideLevelCharacteristic,
    addFilterLifeLevelCharacteristic

};
