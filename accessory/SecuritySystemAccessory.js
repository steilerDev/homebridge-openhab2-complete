'use strict';

const Accessory = require('./Accessory');

const CONFIG = {
    homeItem: "homeItem",
    homeItemInverted: "homeItemInverted",
    awayItem: "awayItem",
    awayItemInverted: "awayItemInverted",
    sleepItem: "sleepItem",
    sleepItemInverted: "sleepItemInverted",
    alarmItem: "alarmItem",
    alarmItemInverted: "alarmItemInverted"
};

class SecuritySystemAccessory extends Accessory.Accessory {

    constructor(platform, config) {
        super(platform, config);

        [this._homeItem] = this._getAndCheckItemType(CONFIG.homeItem, ['Switch'], true);
        this._homeItemInverted = Accessory.checkInvertedConf(this._config, CONFIG.homeItemInverted);
        [this._awayItem] = this._getAndCheckItemType(CONFIG.awayItem, ['Switch'], true);
        this._awayItemInverted = Accessory.checkInvertedConf(this._config, CONFIG.awayItemInverted);
        [this._sleepItem] = this._getAndCheckItemType(CONFIG.sleepItem, ['Switch'], true);
        this._sleepItemInverted = Accessory.checkInvertedConf(this._config, CONFIG.sleepItemInverted);
        [this._alarmItem] = this._getAndCheckItemType(CONFIG.alarmItem, ['Switch'], true);
        this._alarmItemInverted = Accessory.checkInvertedConf(this._config, CONFIG.alarmItemInverted);

        if(!(this._homeItem || this._awayItem || this._sleepItem || this._armItem)) {
            throw new Error(`No item defined for security system ${this.name}: ${JSON.stringify(this._config)}`);
        }

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Security System'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating security system service for ${this.name}`);

        let securitySystemService = new this.Service.SecuritySystem(this.name);

        securitySystemService.getCharacteristic(this.Characteristic.SecuritySystemCurrentState)
            .on('get', this._getSystemState.bind(this));

        securitySystemService.getCharacteristic(this.Characteristic.SecuritySystemTargetState)
            .on('get', this._getSystemState.bind(this))
            .on('set', this._setSystemState.bind(this))
            .on('set', function(value) { // We will use this to set the actual position to the target position, in order to stop showing 'Closing...' or 'Opening...'
                setTimeout(function(value) {
                        securitySystemService.setCharacteristic(this.Characteristic.SecuritySystemCurrentState, value);
                    }.bind(this, value),
                    5000
                );
            }.bind(this));

        return securitySystemService;
    }

    _getSystemState(callback) {
        try {
            if(this._alarmItem) {
                this._log.debug(`Checking ${this.name} for alarm triggered`);
                let alarmItemState = this._transform(this._alarmItemInverted, this._openHAB.getStateSync(this._alarmItem));
                if(alarmItemState) {
                    this._log.debug(`Setting ${this.name} to alarm triggered`);
                    callback(null, this.Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED);
                    return;
                }
            }

            if(this._homeItem) {
                this._log.debug(`Checking ${this.name} for home armed`);
                let homeItemState = this._transform(this._homeItemInverted, this._openHAB.getStateSync(this._homeItem));
                if(homeItemState) {
                    this._log.debug(`Setting ${this.name} to home armed`);
                    callback(null, this.Characteristic.SecuritySystemCurrentState.STAY_ARM);
                    return;
                }
            }

            if(this._awayItem) {
                this._log.debug(`Checking ${this.name} for away armed`);
                let awayItemState = this._transform(this._awayItemInverted, this._openHAB.getStateSync(this._awayItem));
                if(awayItemState) {
                    this._log.debug(`Setting ${this.name} to away armed`);
                    callback(null, this.Characteristic.SecuritySystemCurrentState.AWAY_ARM);
                    return;
                }
            }

            if(this._sleepItem) {
                this._log.debug(`Checking ${this.name} for sleep armed`);
                let sleepItemState = this._transform(this._sleepItemInverted, this._openHAB.getStateSync(this._sleepItem));
                if(sleepItemState) {
                    this._log.debug(`Setting ${this.name} to sleep armed`);
                    callback(null, this.Characteristic.SecuritySystemCurrentState.SLEEP_ARM);
                    return;
                }
            }

            callback(null, this.Characteristic.SecuritySystemCurrentState.DISARMED);
        } catch(e) {
            callback(e);
        }
    }

    _setSystemState(value, callback) {
        switch(value) {
            case this.Characteristic.SecuritySystemTargetState.STAY_ARM:
                this._setCharacteristicState(this._homeItem, this._homeItemInverted, true, callback);
                this._setCharacteristicState(this._awayItem, this._awayItemInverted, false);
                this._setCharacteristicState(this._sleepItem, this._sleepItemInverted, false);
                this._setCharacteristicState(this._alarmItem, this._alarmItemInverted, false);
                break;
            case this.Characteristic.SecuritySystemTargetState.AWAY_ARM:
                this._setCharacteristicState(this._homeItem, this._homeItemInverted, false);
                this._setCharacteristicState(this._awayItem, this._awayItemInverted, true, callback);
                this._setCharacteristicState(this._sleepItem, this._sleepItemInverted, false);
                this._setCharacteristicState(this._alarmItem, this._alarmItemInverted, false);
                break;
            case this.Characteristic.SecuritySystemTargetState.NIGHT_ARM:
                this._setCharacteristicState(this._homeItem, this._homeItemInverted, false);
                this._setCharacteristicState(this._awayItem, this._awayItemInverted, false);
                this._setCharacteristicState(this._sleepItem, this._sleepItemInverted, true, callback);
                this._setCharacteristicState(this._alarmItem, this._alarmItemInverted, false);
                break;
            case this.Characteristic.SecuritySystemTargetState.DISARM:
                this._setCharacteristicState(this._homeItem, this._homeItemInverted, false, callback);
                this._setCharacteristicState(this._awayItem, this._awayItemInverted, false);
                this._setCharacteristicState(this._sleepItem, this._sleepItemInverted, false);
                this._setCharacteristicState(this._alarmItem, this._alarmItemInverted, false);
                break;
        }
    }

    _setCharacteristicState(item, inverted, value, callback) {
        if(item) {
            this._log.debug(`Set Characteristic called for ${item}, with inverted ${inverted} and value ${value}`);
            Accessory.setState.bind(this)(item, this._transform.bind(null, inverted), value, callback);
        } else if(callback) {
            callback();
        }
    }

    _transform(inverted, value) {
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

}

const type = "security";

function createAccessory(platform, config) {
    return new SecuritySystemAccessory(platform, config);
}

module.exports = {createAccessory, type};
