'use strict';

const {getState, setState} = require('../../util/Accessory');

const CLIMATE_AIRPURIFIER_CONFIG = {
    modeItem: "modeItem",
    purifyingItem: "purifyingItem",
};

function addCurrentAirPurifierStateCharacteristic(service) {
    let INACTIVE = 0;       // = Characteristic.CurrentAirPurifierState.INACTIVE
    let IDLE = 1;           // = Characteristic.CurrentAirPurifierState.IDLE
    let PURIFYING_AIR = 2;  // = Characteristic.CurrentAirPurifierState.PURIFYING_AIR
    try {
        let characteristic = service.getCharacteristic(Characteristic.CurrentAirPurifierState);
        let [item] = this._getAndCheckItemType(CLIMATE_AIRPURIFIER_CONFIG.purifyingItem, ['Contact', 'Switch']);
        this._log.debug(`Creating current air purifier state characteristic for ${this.name} with item ${item}`);

        let transformation = {
            "OFF": IDLE,
            "ON": PURIFYING_AIR,
            "CLOSED": IDLE,
            "OPEN": PURIFYING_AIR
        };

        characteristic.on('get', getState.bind(this,
            item,
            transformation
        ));

        this._subscribeCharacteristic(characteristic,
            item,
            transformation
        );
    } catch (e) {
        let msg = `Not configuring current air purifier state characteristic for ${this.name}: ${e.message}`;
        service.removeCharacteristic(characteristic);
        throw new Error(msg);
    }
}

function addTargetAirPurifierStateCharacteristic(service) {
    let MANUAL = 0; // = Characteristic.TargetAirPurifierState.MANUAL
    let AUTO = 1;   // = Characteristic.TargetAirPurifierState.AUTO
    try {
        let characteristic = service.getCharacteristic(Characteristic.TargetAirPurifierState);
        let [item] = this._getAndCheckItemType(CLIMATE_AIRPURIFIER_CONFIG.modeItem, ['Contact', 'Switch']);
        this._log.debug(`Creating target air purifier state characteristic for ${this.name} with item ${item}`);

        let transformation = {
            "OFF": MANUAL,
            "ON": AUTO,
            "CLOSED": MANUAL,
            "OPEN": AUTO
        };

        characteristic.on('get', getState.bind(this,
            item,
            transformation
        ))
        .on('set', setState.bind(this,
            item,
            transformation
        ));

        this._subscribeCharacteristic(characteristic,
            item,
            transformation
        );
    } catch (e) {
        let msg = `Not configuring target air purifier state characteristic for ${this.name}: ${e.message}`;
        service.removeCharacteristic(characteristic);
        throw new Error(msg);
    }
}

module.exports = {
    addCurrentAirPurifierStateCharacteristic,
    addTargetAirPurifierStateCharacteristic
};