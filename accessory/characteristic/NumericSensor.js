'use strict';

const {getState} = require('../../util/Accessory');

const NUMERIC_CONFIG = {
    item: "item"
};

function addNumericSensorCharacteristic(service, characteristic, optional) {
    try {

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
    } catch(e) {
        let msg = `Not configuring numeric sensor characteristic for ${this.name}: ${e.message}`;
        service.removeCharacteristic(characteristic);
        if(optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
}

function addCurrentRelativeHumidityCharacteristic(service) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity));
}

function addCurrentAmbientLightLevelCharacteristic(service) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CurrentAmbientLightLevel));
}

function addCurrentTemperatureCharacteristic(service) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CurrentTemperature));
}
module.exports = {
    addCurrentRelativeHumidityCharacteristic,
    addCurrentAmbientLightLevelCharacteristic,
    addCurrentTemperatureCharacteristic
};
