'use strict';

const {CurrentTargetPositionActorAccessory} = require('./CurrentTargetPositionActor');

class WindowAccessory extends CurrentTargetPositionActorAccessory {

    constructor(platform, config) {
        super(platform, config);

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Window'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating window service for ${this.name} [${this._item}]`);
        let windowService = new this.Service.Window(this.name);
        this._configureCurrentPositionCharacteristic(windowService);
        this._configureTargetPositionCharacteristic(windowService);
        this._configurePostitionStateCharacteristic(windowService);
        this._configureHoldPosition(windowService);

        return windowService;
    }
}

const type = "window";

function createAccessory(platform, config) {
    return new WindowAccessory(platform, config);
}

module.exports = {createAccessory, type};

