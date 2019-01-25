'use strict';

const Accessory = require('./Accessory');

const CONFIG = {
    item: "item"
};

class SwitchAccessory extends Accessory.Accessory {

    constructor(platform, config) {
        super(platform, config);

        if(!(this._config[CONFIG.item])) {
            throw new Error(`Required item not defined: ${JSON.stringify(this._config)}`)
        } else {
            this._item = this._config[CONFIG.item];
        }

        // This will throw an error, if the item does not match the array.
        this._getAndCheckItemType(this._item, ['Switch']);

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Switch'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating switch service for ${this.name} [${this._item}]`);
        let switchService = new this.Service.Switch(this.name);
        switchService.getCharacteristic(this.Characteristic.On)
            .on('set', Accessory.setState.bind(this, this._item, {
                true: "ON",
                false: "OFF"
            }))
            .on('get', Accessory.getState.bind(this, this._item, {
                "ON": true,
                "OFF": false
            }));

        return switchService;
    }
}

const type = "switch";

function createAccessory(platform, config) {
    return new SwitchAccessory(platform, config);
}

module.exports = {createAccessory, type};
