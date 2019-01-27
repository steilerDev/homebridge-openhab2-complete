'use strict';

const {BinaryActorAccessory} = require('./BinaryActor');

class FanAccessory extends BinaryActorAccessory {

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
        let primaryService = new this.Service.Fan(this.name);
        this._configureOnCharacteristic(primaryService);
        return primaryService;
    }
}

const type = "fan";

function createAccessory(platform, config) {
    return new FanAccessory(platform, config);
}

module.exports = {createAccessory, type};
