'use strict';

const {setState} = require('../../util/Accessory');

const CURRENT_TARGET_SECURITY_CONFIG = {
    homeItem: "homeItem",
    homeItemInverted: "homeItemInverted",
    awayItem: "awayItem",
    awayItemInverted: "awayItemInverted",
    sleepItem: "sleepItem",
    sleepItemInverted: "sleepItemInverted",
    alarmItem: "alarmItem",
    alarmItemInverted: "alarmItemInverted"
};

let STAY_ARM = 0;
let AWAY_ARM = 1;
let NIGHT_ARM = 2;
let DISARMED = 3;
let ALARM_TRIGGERED = 4;

let TRANSFORMATION = {
    "home": STAY_ARM,
    "away": AWAY_ARM,
    "sleep": NIGHT_ARM,
    "alarm": ALARM_TRIGGERED
};

function addSecuritySystemStateCharacteristic(service) {
    let items = {};

    try {
        let [alarmItem] = this._getAndCheckItemType(CURRENT_TARGET_SECURITY_CONFIG.alarmItem, ['Switch']);
        let alarmItemInverted = this._checkInvertedConf(CURRENT_TARGET_SECURITY_CONFIG.alarmItemInverted);
        items["alarm"] = [alarmItem, alarmItemInverted];
    } catch(e) {
        this._log.debug(`Not adding alarm item to security system: ${e.message}`);
    }

    try {
        let [homeItem] = this._getAndCheckItemType(CURRENT_TARGET_SECURITY_CONFIG.homeItem, ['Switch']);
        let homeItemInverted = this._checkInvertedConf(CURRENT_TARGET_SECURITY_CONFIG.homeItemInverted);
        items["home"] = [homeItem, homeItemInverted];
    } catch(e) {
        this._log.debug(`Not adding home item to security system: ${e.message}`);
    }

    try {
        let [awayItem] = this._getAndCheckItemType(CURRENT_TARGET_SECURITY_CONFIG.awayItem, ['Switch']);
        let awayItemInverted = this._checkInvertedConf(CURRENT_TARGET_SECURITY_CONFIG.awayItemInverted);
        items["away"] = [awayItem, awayItemInverted];
    } catch(e) {
        this._log.debug(`Not adding home item to security system: ${e.message}`);
    }

    try {
        let [sleepItem] = this._getAndCheckItemType(CURRENT_TARGET_SECURITY_CONFIG.sleepItem, ['Switch']);
        let sleepItemInverted = this._checkInvertedConf(CURRENT_TARGET_SECURITY_CONFIG.sleepItemInverted);
        items ["sleep"] = [sleepItem, sleepItemInverted];
    } catch(e) {
        this._log.debug(`Not adding sleep item to security system: ${e.message}`);
    }

    let length = 0;
    for(var key in items) {
        this._subscribeCharacteristic(service.getCharacteristic(this.Characteristic.SecuritySystemCurrentState),
            items[key][0],
            _transformSecuritySystemState.bind(this,
                key,
                items[key][1],
                service.getCharacteristic(this.Characteristic.SecuritySystemCurrentState)
            )
        );
        length++;
    }

    if(length === 0) {
        throw new Error(`No item defined for security system ${this.name}: ${JSON.stringify(this._config)}`);
    }

    service.getCharacteristic(this.Characteristic.SecuritySystemCurrentState)
        .on('get', _getSystemState.bind(this, items));

    service.getCharacteristic(this.Characteristic.SecuritySystemTargetState)
        .on('get', _getSystemState.bind(this, items))
        .on('set', _setSystemState.bind(this, items));
}

// Todo: Inverted!
function _transformSecuritySystemState(thisItemMode, inverted, characteristic, value) {
    let currentState = characteristic.value;

    if(value === "ON" || (inverted && value === "OFF")) {
        return TRANSFORMATION[thisItemMode];
    } else if(currentState === TRANSFORMATION[thisItemMode]) {
        return DISARMED;
    } else {
        return currentState;
    }
}

function _transformSecuritySystemValue(inverted, value) {
    if(value === "ON") {
        return !inverted;
    } else if(value === "OFF") {
        return inverted;
    } else if (value === true) {
        return inverted ? "OFF" : "ON";
    } else if (value === false) {
        return inverted ? "ON" : "OFF";
    } else {
        if(value instanceof Error) {
            throw value;
        } else {
            throw new Error(`Unable to convert value ${value} for security system`);
        }
    }
}

function _getSystemState(items, callback) {
    try {
        this._log.error(`Checking security system state based on item: ${JSON.stringify(items)}`);
        for(var key in items) {
            this._log.debug(`Checking ${this.name} for ${key} mode`);
            let thisItem = items[key][0];
            let thisItemInverted = items[key][1];
            let thisItemState = _transformSecuritySystemValue(thisItemInverted, this._openHAB.getStateSync(thisItem));
            if(thisItemState) {
                this._log.debug(`Setting ${this.name} to ${key} mode`);
                switch(key) {
                    case "alarm":
                        callback(null, ALARM_TRIGGERED);
                        return;
                    case "home":
                        callback(null, STAY_ARM);
                        return;
                    case "away":
                        callback(null, AWAY_ARM);
                        return;
                    case "sleep":
                        callback(null, NIGHT_ARM);
                        return;
                }
            }
        }
        this._log.error(`Security system looks unarmed`);
        callback(null, DISARMED);
    } catch(e) {
        callback(e);
    }
}

function _setSystemState(items, value, callback) {
    for(var key in items) {
        let thisItem = items[key][0];
        let thisItemInverted = items[key][1];
        let newState = false;
        if(TRANSFORMATION[key] === value) {
            newState = true;
        }
        setState.bind(this)(thisItem, _transformSecuritySystemValue.bind(this, thisItemInverted), newState);
    }
    callback();
}

module.exports = {addSecuritySystemStateCharacteristic};

