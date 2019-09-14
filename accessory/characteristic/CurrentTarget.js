'use strict';

const {getState, setState} = require('../../util/Util');

function addCurrentStateCharacteristic(characteristic, item, itemType, inverted, transformation, targetCharacteristic) {
    this._log.debug(`Creating current state characteristic for ${this.name} with item ${item} (${itemType}), inverted set to ${inverted}`);

    characteristic.on('get', getState.bind(this,
            item,
            transformation.bind(this,
                itemType,
                inverted
            )
        ));

    let callback;
    if(targetCharacteristic) {
        this._log.debug(`Creating characteristic for ${this.name} with item ${item} in manu mode`);
        callback = function(value) {
            if(targetCharacteristic.value !== value) {
                targetCharacteristic.setValue(value, null, "openHABIgnore");
            }
        }
    }

    this._subscribeCharacteristic(characteristic,
        item,
        transformation.bind(this,
            itemType,
            inverted
        ),
        callback
    );
}

function addTargetStateCharacteristic(characteristic, item, itemType, inverted, stateItem, stateItemType, stateItemInverted, transformation, stateItemTransformation) {
    this._log.debug(`Creating target state characteristic for ${this.name} with item ${item} (${itemType}), inverted set to ${inverted} and state item ${stateItem} (${stateItemType}), inverted set to ${stateItemInverted}`);

    // If HomeKit is curious about the target position we will give the actual position
    characteristic.on('get', getState.bind(this,
            stateItem,
            stateItemTransformation.bind(this,
                stateItemType,
                stateItemInverted
            )
        ))
        .on('set', setState.bind(this,
            item,
            transformation.bind(this,
                itemType,
                inverted
            )
        ));
}

module.exports = {
    addCurrentStateCharacteristic,
    addTargetStateCharacteristic,
};

