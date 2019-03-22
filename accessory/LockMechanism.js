'use strict';

const {Accessory} = require('../util/Accessory');
const {addCurrentLockStateCharacteristic, addTargetLockStateCharacteristic} = require('./characteristic/CurrentTargetLock');

class LockMechanismAccessory extends Accessory {
    _getPrimaryService() {
        this._log.debug(`Creating lock mechanism service for ${this.name}`);
        let primaryService = new this.Service.LockMechanism(this.name);
        addCurrentLockStateCharacteristic.bind(this)(primaryService);
        addTargetLockStateCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "lock";

function createAccessory(platform, config) {
    return new LockMechanismAccessory(platform, config, 'Lock Mechanism');
}

module.exports = {createAccessory, type};
