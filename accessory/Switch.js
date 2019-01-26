'use strict';

const {BinaryActorAccessory} = require('./BinaryActor');

class SwitchAccessory extends BinaryActorAccessory {

    constructor(platform, config) {
        super(platform, config);

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Switch'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating switch service for ${this.name} [${this._item}]`);

        return this._configureOnCharacteristic(new this.Service.Switch(this.name));
    }
}

const type = "switch";

function createAccessory(platform, config) {
    return new SwitchAccessory(platform, config);
}

module.exports = {createAccessory, type};
