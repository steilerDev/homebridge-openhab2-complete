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

function addActiveIdentifier(service) {
    service.setCharacteristic(this.Characteristic.ActiveIdentifier, 1);
    service.getCharacteristic(this.Characteristic.ActiveIdentifier)
        .on('set', (newValue, callback) => {

            // the value will be the value you set for the Identifier Characteristic
            // on the Input Source service that was selected - see input sources below.

            this._log.info('set Active Identifier => setNewValue: ' + newValue);
            callback(null);
        });
}

function addConfiguredName(service) {
    service.setCharacteristic(this.Characteristic.ConfiguredName, this.name);
}

function addRemoteKey(service) {
    service.getCharacteristic(this.Characteristic.RemoteKey)
        .on('set', (newValue, callback) => {
            switch (newValue) {
                case this.Characteristic.RemoteKey.REWIND: {
                    this._log.info('set Remote Key Pressed: REWIND');
                    break;
                }
                case this.Characteristic.RemoteKey.FAST_FORWARD: {
                    this._log.info('set Remote Key Pressed: FAST_FORWARD');
                    break;
                }
                case this.Characteristic.RemoteKey.NEXT_TRACK: {
                    this._log.info('set Remote Key Pressed: NEXT_TRACK');
                    break;
                }
                case this.Characteristic.RemoteKey.PREVIOUS_TRACK: {
                    this._log.info('set Remote Key Pressed: PREVIOUS_TRACK');
                    break;
                }
                case this.Characteristic.RemoteKey.ARROW_UP: {
                    this._log.info('set Remote Key Pressed: ARROW_UP');
                    break;
                }
                case this.Characteristic.RemoteKey.ARROW_DOWN: {
                    this._log.info('set Remote Key Pressed: ARROW_DOWN');
                    break;
                }
                case this.Characteristic.RemoteKey.ARROW_LEFT: {
                    this._log.info('set Remote Key Pressed: ARROW_LEFT');
                    break;
                }
                case this.Characteristic.RemoteKey.ARROW_RIGHT: {
                    this._log.info('set Remote Key Pressed: ARROW_RIGHT');
                    break;
                }
                case this.Characteristic.RemoteKey.SELECT: {
                    this._log.info('set Remote Key Pressed: SELECT');
                    break;
                }
                case this.Characteristic.RemoteKey.BACK: {
                    this._log.info('set Remote Key Pressed: BACK');
                    break;
                }
                case this.Characteristic.RemoteKey.EXIT: {
                    this._log.info('set Remote Key Pressed: EXIT');
                    break;
                }
                case this.Characteristic.RemoteKey.PLAY_PAUSE: {
                    this._log.info('set Remote Key Pressed: PLAY_PAUSE');
                    break;
                }
                case this.Characteristic.RemoteKey.INFORMATION: {
                    this._log.info('set Remote Key Pressed: INFORMATION');
                    break;
                }
            }
        });
}

function addSleepDiscoveryMode(service) {
    service.setCharacteristic(this.Characteristic.SleepDiscoveryMode, this.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);
}

module.exports = {
    addMuteCharacteristic,
    addVolumeCharacteristic,
    addActiveIdentifier,
    addConfiguredName,
    addRemoteKey,
    addSleepDiscoveryMode
};