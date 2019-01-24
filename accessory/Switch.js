'use strict';

const Accessory = require('./Accessory');

const CONFIG = {
    habItem: "habItem"
};

class SwitchAccessory extends Accessory.Accessory {

    constructor(platform, config) {
        super(platform, config);

        if(!(this._config[CONFIG.habItem])) {
            throw new Error(`Required habItem not defined: ${JSON.stringify(this._config)}`)
        } else {
            this._habItem = this._config[CONFIG.habItem];
        }

        // This will throw an error, if the item does not match the array.
        this._getAndCheckItemType(this._habItem, ['Switch']);

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Switch'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating switch service for ${this.name} [${this._habItem}]`);
        let switchService = new this.Service.Switch(this.name);
        switchService.getCharacteristic(this.Characteristic.On)
            .on('set', Accessory.setState.bind(this, this._habItem, {
                true: "ON",
                false: "OFF"
            }))
            .on('get', Accessory.getState.bind(this, this._habItem, {
                "ON": true,
                "OFF": false
            }));

        return switchService;
    }
}

module.exports = {SwitchAccessory};
