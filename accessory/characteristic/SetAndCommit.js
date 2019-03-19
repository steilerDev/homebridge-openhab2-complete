'use strict';

const {getState} = require('../../util/Accessory');

const SET_AND_COMMIT_CONFIG = {
    item: "item"
};

// characteristicType: either `binary`, `hue`, `saturation` or `brightness`
function addSetAndCommitCharacteristic(service, characteristic, characteristicType, expectedItems, transformation, commitFunction, optional) {
    try {
        let [item, type] = this._getAndCheckItemType(SET_AND_COMMIT_CONFIG.item, expectedItems);

        // Synchronisation helper
        _releaseLocks.bind(this)();
        this._log.debug(`Creating ${characteristicType} characteristic for ${this.name} with item ${item}`);

        characteristic.on('set', _setState.bind(this, characteristicType))
            .on('set', _commitState.bind(this,
                commitFunction.bind(this, service, type),
                item
            ))
            .on('get', getState.bind(this,
                item,
                transformation.bind(this, characteristicType, type)
            ));

        this._subscribeCharacteristic(characteristic,
            item,
            transformation.bind(this, characteristicType, type)
        );

    } catch(e) {
        let msg = `Not configuring ${characteristicType} characteristic for ${this.name}: ${e.message}`;
        service.removeCharacteristic(characteristic);
        if (optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
}

function _releaseLocks() {
    this._log.debug(`Cleaning up and releasing locks`);
    this._newState = {};
    this._commitLock = false;
    this._stateLock = false;
}

// Set the state unless it's locked
function _setState(stateType, value, callback, context, connectionID) {
    if(context === "openHABIgnore") {
        this._log.debug(`Not changing target state of ${this.name} due to ignore flag`);
    } else {
        this._log.debug(`Change ${stateType} target state of ${this.name} to ${value}`);
        if (!(this._stateLock)) {
            this._newState[stateType] = value;
        }
    }
}


// Wait for all states to be set (250ms should be sufficient) and then commit once
function _commitState(commitFunction, item, value, callback, context, connectionID) {
    if(this._commitLock) {
        this._log.debug(`Not executing commit due to commit lock`);
        callback();
    } else if(context === "openHABIgnore") {
        this._log.debug(`Not executing commit due to ignore flag`);
        callback();
    } else {
        this._commitLock = true;
        setTimeout(function() {
            let command = commitFunction();
            _releaseLocks.bind(this)();
            if(command) {
                if(command instanceof Error) {
                    this._log.error(command.message);
                    callback(command);
                } else {
                    this._log(`Updating state of ${this.name} with item ${item} to ${command}`);
                    this._openHAB.sendCommand(item, command, callback);
                }
            } else {
                callback(new Error("Command was not set"));
            }
            this._commitLock = false;

        }.bind(this), 125);
    }
}


module.exports = {addSetAndCommitCharacteristic};