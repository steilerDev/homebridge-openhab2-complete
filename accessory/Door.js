'use strict';

const {CurrentTargetPositionActorAccessory} = require('./CurrentTargetPositionActor');

class DoorAccessory extends CurrentTargetPositionActorAccessory {

    constructor(platform, config) {
        super(platform, config);

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Door'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating door service for ${this.name} [${this._item}]`);
        let doorService = new this.Service.Door(this.name);
        this._configureCurrentPositionCharacteristic(doorService);
        this._configureTargetPositionCharacteristic(doorService);
        this._configurePostitionStateCharacteristic(doorService);
        this._configureHoldPosition(doorService);

        return doorService;
    }
}

const type = "door";

function createAccessory(platform, config) {
    return new DoorAccessory(platform, config);
}

module.exports = {createAccessory, type};

