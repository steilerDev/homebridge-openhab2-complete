'use strict';

const Accessory = require('./Accessory');

const CONFIG = {
    item: "item",
    inverted: "inverted"
};

class LockMechanismAccessory extends Accessory.Accessory {

    constructor(platform, config) {
        super(platform, config);

        [this._item] = this._getAndCheckItemType(CONFIG.item, ['Switch']);

        this._inverted = Accessory.checkInvertedConf(this._config, CONFIG.inverted);

        this._transformation = {
            "ON": this._inverted ? this.Characteristic.LockCurrentState.UNSECURED : this.Characteristic.LockCurrentState.SECURED,
            "OFF": this._inverted ? this.Characteristic.LockCurrentState.SECURED : this.Characteristic.LockCurrentState.UNSECURED,
            [this.Characteristic.LockTargetState.UNSECURED]: this._inverted ? "ON" : "OFF",
            [this.Characteristic.LockCurrentState.SECURED ]: this._inverted ? "OFF" : "ON"
        };

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Lock Mechanism'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating lock mechanism service for ${this.name} [${this._item}]`);

        let lockMechanismService = new this.Service.LockMechanism(this.name);

        lockMechanismService.getCharacteristic(this.Characteristic.LockCurrentState)
            .on('get', Accessory.getState.bind(this, this._item, this._transformation));

        lockMechanismService.getCharacteristic(this.Characteristic.LockTargetState)
            .on('get', Accessory.getState.bind(this, this._item, this._transformation))
            .on('set', Accessory.setState.bind(this, this._item, this._transformation))
            .on('set', function(value) { // We will use this to set the actual position to the target position, in order to stop showing 'Closing...' or 'Opening...'
                setTimeout(function(value) {
                        lockMechanismService.setCharacteristic(this.Characteristic.LockCurrentState, value);
                    }.bind(this, value),
                    5000
                );
            }.bind(this));

        return lockMechanismService;
    }

}

const type = "lock";

function createAccessory(platform, config) {
    return new LockMechanismAccessory(platform, config);
}

module.exports = {createAccessory, type};