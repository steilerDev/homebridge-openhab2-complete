'use strict';

const {getState, setState} = require('../../util/Util');

const NUMERIC_CONFIG = {
    item: "item"
};

function addNumericSensorCharacteristic(service, characteristic, CONF_MAP, optional) {
    addNumericSensorCharacteristicWithTransformation.bind(this)(service, characteristic, CONF_MAP, parseFloat, optional);
}

function addNumericSensorCharacteristicWithTransformation(service, characteristic, CONF_MAP, transformation, optional) {
    try {

        let [item] = this._getAndCheckItemType(CONF_MAP.item, ['Number', 'Dimmer', 'Rollershutter']);

        this._log.debug(`Creating numeric sensor characteristic for ${this.name} with ${item}`);

        characteristic.on('get', getState.bind(this,
            item,
            transformation
        ));

        this._subscribeCharacteristic(characteristic,
            item,
            transformation
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

function addNumericSensorActorCharacteristic(service, characteristic, CONF_MAP, optional) {
    addNumericSensorActorCharacteristicWithTransformation.bind(this)(service, characteristic, CONF_MAP, parseFloat, optional);
}

function addNumericSensorActorCharacteristicWithTransformation(service, characteristic, CONF_MAP, transformation, optional) {
    addNumericSensorActorCharacteristicWithDistinctTransformation.bind(this)(service, characteristic, CONF_MAP, transformation, transformation, optional);
}

function addNumericSensorActorCharacteristicWithDistinctTransformation(service, characteristic, CONF_MAP, setTransformation, getTransformation, optional) {
    try {

        let [item] = this._getAndCheckItemType(CONF_MAP.item, ['Number', 'Dimmer', 'Rollershutter']);

        this._log.debug(`Creating numeric sensor/actor characteristic for ${this.name} with ${item}`);

        characteristic.on('set', setState.bind(this,
            item,
            setTransformation
        ))
        .on('get', getState.bind(this,
            item,
            getTransformation
        ));

        this._subscribeCharacteristic(characteristic,
            item,
            getTransformation
        );
    } catch(e) {
        let msg = `Not configuring numeric actor characteristic for ${this.name}: ${e.message}`;
        service.removeCharacteristic(characteristic);
        if(optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
}

function addCurrentRelativeHumidityCharacteristic(service) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity), NUMERIC_CONFIG);
}

function addCurrentAmbientLightLevelCharacteristic(service) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CurrentAmbientLightLevel), NUMERIC_CONFIG);
}

function addAirQualityCharacteristic(service) {
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.AirQuality), NUMERIC_CONFIG);
}

module.exports = {
    addCurrentRelativeHumidityCharacteristic,
    addCurrentAmbientLightLevelCharacteristic,
    addNumericSensorCharacteristic,
    addNumericSensorCharacteristicWithTransformation,
    addNumericSensorActorCharacteristic,
    addNumericSensorActorCharacteristicWithTransformation,
    addNumericSensorActorCharacteristicWithDistinctTransformation,
    addAirQualityCharacteristic
};
