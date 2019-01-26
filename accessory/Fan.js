'use strict';

const {BinaryActor} = require('./BinaryActor');

class FanAccessory extends BinaryActor {

    constructor(platform, config) {
        super(platform, config);

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Fan'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating fan service for ${this.name} [${this._item}]`);

        return this._configureOnCharacteristic(new this.Service.Fan(this.name));
    }
}

const type = "fan";

function createAccessory(platform, config) {
    return new FanAccessory(platform, config);
}

module.exports = {createAccessory, type};
