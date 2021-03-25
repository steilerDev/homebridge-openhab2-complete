'use strict';

const {URL} = require('url');
const request = require('request');
const syncRequest = require('sync-request');
const EventSource = require('eventsource');
const {Cache} = require('./Cache');

// 30 mins ttl for cached item states
const valueCacheTTL = 30 * 60 * 1000;
// Checking every minute, if item states from the cache need to be cleared
const monitorInterval = 5 * 60 * 1000;

class OpenHAB {

    constructor(hostname, port, log) {
        this._log = log;

        if(hostname.startsWith("http://") || hostname.startsWith("https://")) {
            this._hostname = hostname;
        } else {
            this._hostname = `http://${hostname}`;
        }
        this._port = port;

        this._valueCache = new Cache(log, valueCacheTTL, monitorInterval);

        this._valueCache.on('expired', function (habItem) {
            this._log.warn(`Item ${habItem}'s state was cleared from the cache, getting the current value`);
            this._getStateWithoutCache(habItem, function(error, value) {
                if(error) {
                   this._log.error(`Unable to set new value for ${habItem}: ${error.message}`);
                } else {
                    if(this._subscriptions[habItem] !== undefined) {
                        this._log.debug(`Received new state for item ${habItem}: ${value}`);
                        this._subscriptions[habItem].forEach(function (callback) {
                            callback(value, habItem);
                        });
                    } else {
                        this._log.debug(`Not pushing new value for ${habItem}, because it is not registered with homebridge`);
                    }
                }
            }.bind(this));
        }.bind(this));

        this._typeCache = new Cache(log);

        this._subscriptions = {};
    }

    _getURL(pathname, search) {
        let newURL = new URL(this._hostname);
        if(this._port !== undefined) {
            newURL.port = this._port;
        }
        if(pathname) {
            newURL.pathname = pathname;
        }
        if(search) {
            newURL.search = search;
        }
       return newURL.href;
    }

    isOnline() {
        try {
          let myURL = this._getURL(`/rest/items`);
          const response = syncRequest('GET', myURL);
          this._log.debug(`Online request for openHAB (${myURL}) resulted in status code ${response.statusCode}`);
          return response.statusCode === 200;
        } catch (e) {
          this._log.warn(`Unable to retrieve openHAB URL ${myURL}: ${e}`);
          return false;
        }
    }

    getState(habItem, callback) {
        let cachedValue = this._valueCache.get(habItem);
        if(cachedValue) {
            this._log.debug(`Getting value for ${habItem} from the cache`);
            callback(null, cachedValue);
        } else {
            this._log.warn(`Getting value for ${habItem} from openHAB, because no cached state exists`);
            this._getStateWithoutCache(habItem, callback);
        }
    }

    _getStateWithoutCache(habItem, callback) {
        let myURL = this._getURL(`/rest/items/${habItem}/state`);
        this._log.debug(`Getting value for ${habItem} from openHAB`);
        request({
                url: myURL,
                method: 'GET'
            },
            function (error, response, body) {
                let returnedError = null;
                let returnedValue = null;
                if(error) {
                    returnedError = error;
                } else if (response.statusCode === 404) {
                    returnedError = new Error(`Item does not exist!`);
                } else if (!(body)) {
                    returnedError = new Error(`Unable to retrieve state`);
                } else {
                    returnedValue = this._cleanOpenHABState(body);
                    this._log.warn(`Caching value ${returnedValue} for ${habItem}`);
                    this._valueCache.set(habItem, returnedValue);
                }

                if(callback !== null && callback !== undefined && typeof (callback) === "function") {
                    callback(returnedError, returnedValue);
                }
            }.bind(this))
    }

    getStateSync(habItem) {
        if(this._valueCache.get(habItem)) {
            this._log.debug(`Getting value for ${habItem} from the cache`);
            return this._valueCache.get(habItem);
        } else {
            this._log.warn(`Getting value for ${habItem} from openHAB, because no cached state exists`);
            let myURL = this._getURL(`/rest/items/${habItem}/state`);
            const response = syncRequest('GET', myURL);
            if (response.statusCode === 404) {
                return new Error(`Item does not exist!`);
            } else if (!(response.body)) {
                return new Error(`Unable to retrieve state`);
            } else {
                let value = this._cleanOpenHABState(response.body.toString('ASCII'));
                this._valueCache.set(habItem, value);
                return value;
            }
        }
    }

    sendCommand(habItem, command, callback) {
        if(this._valueCache.exists(habItem)) {
            this._log.debug(`Invalidating cache for ${habItem}`);
            this._valueCache.del(habItem);
        }
        let myURL = this._getURL(`/rest/items/${habItem}`);
        request({
            url: myURL,
            method: 'POST',
            body: command,
            headers: {
                'Content-Type': 'text/plain'
            }
        },
        function(error, response) {
            if(error) {
                callback(error);
            } else if (response.statusCode === 404) {
                callback(new Error(`Item does not exist!`));
            } else if (response.statusCode === 400) {
                callback(new Error(`Item command null`));
            } else {
                callback(null);
            }
        })
    }

    updateState(habItem, state, callback) {
        if(this._valueCache.exists(habItem)) {
            this._log.debug(`Invalidating cache for ${habItem}`);
            this._valueCache.del(habItem);
        }
        let myURL = this._getURL(`/rest/items/${habItem}/state`);
        request({
                url: myURL,
                method: 'PUT',
                body: state
        },
        function(error, response) {
            if(error) {
                callback(error);
            } else if (response.statusCode === 404) {
                callback(new Error(`Item does not exist!`));
            } else if (response.statusCode === 400) {
                callback(new Error(`Item state null`));
            } else {
                callback(null);
            }
        })
    }

    // Will call callback with callback(error, type)
    getItemType(habItem) {
        return this._typeCache.get(habItem);
    }

    syncItemTypes() {
        this._log.info(`Syncing all items & types from openHAB`);
        let myURL = this._getURL(`/rest/items`, `recursive=false&fields=name%2Ctype%2Ceditable`);
        const response = syncRequest('GET', myURL);
        if (response.statusCode !== 200) {
            return new Error(`Unable to get items: HTTP code ${response.statusCode}!`);
        } else {
            const items = JSON.parse(response.body);
            if(items.length > 0) {
                this._log.debug(`Got array with ${items.length} item/s`);
                items.forEach(function(item) {
                    let type = this._cleanOpenHABType(item.type);
                    this._log.debug(`Got item ${item.name} of type ${type}, adding to type cache`);
                    this._typeCache.set(item.name, type);
                }.bind(this));
            } else {
                this._log.error(`Received no items from openHAB, unable to sync states!`);
            }
        }
    }

    syncItemValues() {
        this._log.info(`Syncing all item values from openHAB`);
        let myURL = this._getURL(`/rest/items`, `recursive=false&fields=name%2Cstate%2Ceditable`);
        const response = syncRequest('GET', myURL);
        if (response.statusCode !== 200) {
            return new Error(`Unable to get item values: HTTP code ${response.statusCode}!`);
        } else {
            const items = JSON.parse(response.body);
            if(items.length > 0) {
                this._log.debug(`Got array with ${items.length} item/s`);
                items.forEach(function(item) {
                    if(this._subscriptions[item.name] !== undefined) {
                        let state = this._cleanOpenHABState(item.state);
                        this._log.debug(`Got item ${item.name} with value ${state}, adding to value cache`);
                        this._valueCache.set(item.name, state);
                    } else {
                        this._log.debug(`Got item ${item.name} with value ${item.state}, not adding to value cache, since it is not linked to homebridge!`);
                    }
                }.bind(this));
            } else {
                this._log.error(`Received no items from openHAB, unable to sync states!`);
            }
        }
    }

    getOpenHABAPIVersion() {
        this._log.debug(`Trying to identify openHAB API Version for host (${this._hostname})...`);
        let myURL = this._getURL(`/rest/`);
        const response = syncRequest('GET', myURL);
        if (response.statusCode !== 200) {
            return new Error(`Unable to get item values: HTTP code ${response.statusCode}!`);
        } else {
            const parsedBody = JSON.parse(response.body);
            let version = parseInt(parsedBody.version);
            this._log.debug(`openHAB API Version for host (${this._hostname}) is (${version}).`);
            return version;
        }
    }

    getItemsTopic() {
        if (typeof this._apiVersion === 'undefined') {
            this._apiVersion = this.getOpenHABAPIVersion(); 
        }
        if(this._apiVersion >= 4) {
            return 'openhab/items/';
        }
        else {
            return 'smarthome/items/';
        }
    }

    subscribe(habItem, callback) {
        if(!this._subscriptions[habItem]) {
            this._subscriptions[habItem] = [];
        }
        this._log.debug(`Queueing subscription for ${habItem}`);
        this._subscriptions[habItem].push(callback);
    }

    startSubscription() {
        let myURL = this._getURL('/rest/events',`topics=${this.getItemsTopic()}`);
        const CLOSED = 2;

        let source = new EventSource(myURL);
        source.onmessage = function (eventPayload) {
            let eventData = JSON.parse(eventPayload.data);
            if (eventData.type === "ItemStateChangedEvent") {
                let item = eventData.topic.replace(this.getItemsTopic(), "").replace("/statechanged", "");
                let value = this._cleanOpenHABState(JSON.parse(eventData.payload).value);

                if(this._subscriptions[item] !== undefined) {
                    this._log.debug(`Received new state for item ${item}: ${value}`);
                    this._valueCache.set(item, value);
                    this._subscriptions[item].forEach(function(callback){
                        callback(value, item);
                    });
                } else {
                    this._log.debug(`Ignoring new state for item ${item} (${value}), because it is not registered with homebridge`);
                }
            }
        }.bind(this);
        source.onerror = function (err) {
            if (err.message) {
                let msg;
                if (err.status) {
                    msg = `${err.status}: ${err.message}`;
                } else {
                    msg = err.message;
                }
                if (source.readyState === CLOSED || err.status === 404) {
                    msg = `Subscription service closed, trying to reconnect in 1sec...`;
                    setTimeout(function () {
                        this._log.warn(`Trying to reconnect subscription service...`);
                        source.close();
                        this.startSubscription();
                    }.bind(this), 1000);
                }
                this._log.error(msg);
            }
        }.bind(this);
    }

    // This function is called before a value received from openHAB was passed to the cache or homebridge application
    _cleanOpenHABState(value) {
        // This checks if the value is a number (eventually followed by a unit) and extracts only the number
        let matchedValue =  value.match(/^\d+((\.|,)\d*)*/i);
        if (matchedValue) {
            // This checks if the value is a number followed by a scientific exponent (e.g. `7E+1`), normalizing notation
            let exponentMatch = value.match(/E\+\d*/i);
            if(exponentMatch) {
                let tempValue = matchedValue[0] * Math.pow(10, parseInt(exponentMatch[0].substring(2)));
                this._log.debug(`Recognized number with potential unit and scientific exponent (${value}), normalizing to ${tempValue}`);
                return `${tempValue}`;
            } else {
                this._log.debug(`Recognized number with potential unit (${value}), extracting only the number: ${matchedValue[0]}`);
                return matchedValue[0];
            }
        } else {
            return value;
        }
    }

    // This function is called before a type received from openHAB was passed to the cache or homebridge application
    _cleanOpenHABType(type) {
        if(type.startsWith("Number")) {
            this._log.debug(`Received item type ${type}, transforming to 'Number'`);
            return "Number";
        } else {
            return type;
        }
    }
}

module.exports = {OpenHAB};
