'use strict';

const {addNumericSensorActorCharacteristic} = require('./Numeric');
const {addBinarySensorActorCharacteristicWithTransformation} = require('./Binary');

const AUDIO_CONFIG = {
    muteItem: "muteItem",
    muteItemInverted: "muteItemInverted",
    volumeItem: "volumeItem"
};

function addMuteCharacteristic(service) {
    let inverted = this._checkInvertedConf(AUDIO_CONFIG.muteItemInverted);
    let transformation = {
        "OFF": inverted ,
        "ON": !inverted,
        [!inverted]: "ON",
        [inverted]: "OFF"
    };
    addBinarySensorActorCharacteristicWithTransformation.bind(this)(service,
        service.getCharacteristic(this.Characteristic.Mute),
        {item: AUDIO_CONFIG.muteItem, inverted: AUDIO_CONFIG.muteItemInverted},
        transformation
    );
}

function addVolumeCharacteristic(service) {
    addNumericSensorActorCharacteristic.bind(this)(service,
        service.getCharacteristic(this.Characteristic.Volume)    ,
        {item: AUDIO_CONFIG.volumeItem},
        true
    );
}

module.exports = {
    addMuteCharacteristic,
    addVolumeCharacteristic
};