'use strict';

const {CurrentTargetPositionActorAccessory} = require('./CurrentTargetPositionActor');

class WindowCoveringAccessory extends CurrentTargetPositionActorAccessory {

    constructor(platform, config) {
        super(platform, config);

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Window Cover'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating window cover service for ${this.name} [${this._item}]`);
        let windowCoveringService = new this.Service.WindowCovering(this.name);
        this._configureCurrentPositionCharacteristic(windowCoveringService);
        this._configureTargetPositionCharacteristic(windowCoveringService);
        this._configurePostitionStateCharacteristic(windowCoveringService);
        this._configureHoldPosition(windowCoveringService);

        return windowCoveringService;
    }
}

const type = "windowcovering";

function createAccessory(platform, config) {
    return new WindowCoveringAccessory(platform, config);
}

module.exports = {createAccessory, type};

