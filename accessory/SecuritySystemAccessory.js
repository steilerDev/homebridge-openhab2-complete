'use strict';

const Accessory = require('./Accessory');

const CONFIG = {
    armItem: "armItem",
    armItemInverted: "armItemInverted",
    alarmItem: "alarmItem",
    alarmItemInverted: "alarmItemInverted"
};

class SecuritySystemAccessory extends Accessory.Accessory {

    constructor(platform, config) {
        super(platform, config);

        [this._armItem] = this._getAndCheckItemType(CONFIG.armItem, ['Switch']);
        this._armItemInverted = Accessory.checkInvertedConf(this._config, CONFIG.armItemInverted);
        [this._alarmItem] = this._getAndCheckItemType(CONFIG.alarmItem, ['Switch']);
        this._alarmItemInverted = Accessory.checkInvertedConf(this._config, CONFIG.alarmItemInverted);

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
        let armItemState = this._openHAB.getStateSync(this._armItem);
        let alarmItemState = this._openHAB.getStateSync(this._alarmItem);

        if(armItemState instanceof Error) {
            callback(armItemState);
        }
        if(alarmItemState instanceof Error) {
            callback(alarmItemState)
        }

        this._log.debug(`Received arm state ${armItemState} and alarm state ${alarmItemState}`);
        if(alarmItemState === "ON" && !this._alarmItemInverted) {
            callback(null, this.Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED);
        } else if(armItemState === "ON" && !this._armItemInverted) {
            callback(null, this.Characteristic.SecuritySystemCurrentState.STAY_ARM);
        } else {
            callback(null, this.Characteristic.SecuritySystemCurrentState.DISARMED);
        }
    }

    _setSystemState(value, callback) {
        let armValue;
        switch(value) {
            case this.Characteristic.SecuritySystemTargetState.STAY_ARM:
            case this.Characteristic.SecuritySystemTargetState.AWAY_ARM:
            case this.Characteristic.SecuritySystemTargetState.NIGHT_ARM:
                armValue = this._armItemInverted ? "OFF": "ON";
                break;
            case this.Characteristic.SecuritySystemTargetState.DISARM:
                armValue = this._armItemInverted ? "ON": "OFF";
                break
        }
        this._log.debug(`Setting security system state to ${armValue}`);
        Accessory.setState.bind(this, this._armItem, null)(armValue, callback);
        Accessory.setState.bind(this, this._alarmItem, null)(this._alarmItemInverted ? "ON" : "OFF");
    }

}

const type = "security";

function createAccessory(platform, config) {
    return new SecuritySystemAccessory(platform, config);
}

module.exports = {createAccessory, type};
