'use strict';

const {getState, setState} = require('../../util/Accessory');

function addCurrentStateCharacteristic(service, characteristic, item, itemType, inverted, transformation) {
    this._log.debug(`Creating current state characteristic for ${this.name} with item ${item} (${itemType}), inverted set to ${inverted}`);

    service.getCharacteristic(characteristic)
        .on('get', getState.bind(this,
            item,
            transformation.bind(this,
                itemType,
                inverted
            )
        ));

    this._subscribeCharacteristic(service,
        characteristic,
        item,
        transformation.bind(this,
            itemType,
            inverted
        )
    );
}

function addTargetStateCharacteristic(service, characteristic, item, itemType, inverted, stateItem, stateItemType, stateItemInverted, transformation, stateItemTransformation) {
    this._log.debug(`Creating target state characteristic for ${this.name} with item ${item} (${itemType}), inverted set to ${inverted} and state item ${stateItem} (${stateItemType}), inverted set to ${stateItemInverted}`);

    // If HomeKit is curious about the target position we will give the actual position
    service.getCharacteristic(characteristic)
        .on('get', getState.bind(this,
            stateItem,
            transformation.bind(this,
                stateItemType,
                stateItemInverted
            )
        ))
        .on('set', setState.bind(this,
            item,
            stateItemTransformation.bind(this,
                itemType,
                inverted
            )
        ));
}

module.exports = {
    addCurrentStateCharacteristic,
    addTargetStateCharacteristic,
};

