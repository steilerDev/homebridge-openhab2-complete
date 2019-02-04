'use strict';

const {getState} = require('../../util/Accessory');

const NUMERIC_CONFIG = {
    item: "item"
};

function addNumericSensorCharacteristic(characteristic) {
    let [item] = this._getAndCheckItemType(NUMERIC_CONFIG.item, ['Number']);

    this._log.debug(`Creating numeric sensor characteristic for ${this.name} with ${item}`);

    characteristic.on('get', getState.bind(this,
            item,
            parseFloat
        ));

    this._subscribeCharacteristic(characteristic,
        item,
        parseFloat
    );
}

function addCurrentRelativeHumidityCharacteristic(service) {
    addNumericSensorCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity));
}

function addCurrentAmbientLightLevelCharacteristic(service) {
    addNumericSensorCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.CurrentAmbientLightLevel));
}

function addCurrentTemperatureCharacteristic(service) {
    addNumericSensorCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.CurrentTemperature));
}
module.exports = {
    addCurrentRelativeHumidityCharacteristic,
    addCurrentAmbientLightLevelCharacteristic,
    addCurrentTemperatureCharacteristic
};
