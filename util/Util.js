
// transformation may be 'undefined', a map or a function [in case of a function the return value needs to be either a valid value or an Error()
function transformValue(transformation, value) {
    if (transformation === null || transformation === undefined) {
        return value;
    } else if (typeof (transformation) === "function") {
        return transformation(value);
    } else if (typeof (transformation) === "object") {
        if (transformation[value] !== undefined) {
            return transformation[value];
        } else if (transformation["_default"] !== undefined) {
            return transformation["_default"];
        } else {
            return new Error(`Unable to transform ${value} using transformation map ${JSON.stringify(transformation)}`);
        }
    }
}

function getState(habItem, transformation, callback) {
    this._log.debug(`Getting state for ${this.name} [${habItem}]`);
    this._openHAB.getState(habItem, function(error, state) {
        if(error) {
            this._log.error(`Unable to get state for ${this.name} [${habItem}]: ${error.message}`);
            if(callback && typeof callback === "function") {
                callback(error);
            }
        } else {
            let transformedState = transformValue(transformation, state);
            this._log(`Received state: ${state} (transformed to ${transformedState}) for ${this.name} [${habItem}]`);
            if(transformedState instanceof Error) {
                this._log.error(transformedState.message);
                if(callback && typeof callback === "function") {
                    callback(transformedState);
                }
            } else {
                if(callback && typeof callback === "function") {
                    callback(null, transformedState);
                }
            }
        }
    }.bind(this));
}

// context and connectionID are variables giving information about the origin of the request. If a setValue/setCharacteristic is called, we are able to manipulate those.
// If context is set to 'openHABIgnore' the actual set state will not be executed towards openHAB
function setState(habItem, transformation, state, callback, context, connectionID) {
    let transformedState = transformValue(transformation, state);
    this._log.debug(`Change target state of ${this.name} [${habItem}] to ${state} (transformed to ${transformedState}) [Context: ${context ? JSON.stringify(context): 'Not defined'}, ConnectionID: ${connectionID}`);
    if(context === "openHABIgnore") {
        callback();
    } else {
        if(transformedState instanceof Error) {
            this._log.error(transformedState.message);
            if(callback && typeof callback === "function") {
                callback(transformedState);
            }
        } else {
            this._openHAB.sendCommand(habItem, `${transformedState}`, function (error) {
                if (error) {
                    this._log.error(`Unable to send command: ${error.message}`);
                    if(callback && typeof callback === "function") {
                        callback(error);
                    }
                } else {
                    this._log(`Changed target state of ${this.name} [${habItem}] to ${transformedState}`);
                    if(callback && typeof callback === "function") {
                        callback();
                    }
                }
            }.bind(this));
        }
    }
}

function dummyTransformation(val) {
    return val;
}

function msleep(n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
function sleep(n) {
    msleep(n*1000);
}

module.exports = {transformValue, getState, setState, dummyTransformation, sleep};
