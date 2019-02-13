'use strict';

const {URL} = require('url');
const request = require('request');
const syncRequest = require('sync-request');
const EventSource = require('eventsource');
const {Cache} = require('./Cache');

// 30 mins ttl for cached item states
const valueCacheTTL = 30 * 60 * 1000;
// Checking every 10 minutes, if item states from the cache need to be cleared
const monitorInterval = 10 * 60 * 1000;

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
            this._getStateWithoutCache(habItem, function (error, value) {
                if (error) {
                    this._log.error(`Unable to get ${habItem}'s new state: ${error.message}`);
                } else {
                    this._log.debug(`Updating cache entry for ${habItem} with new value ${value}`);
                    this._valueCache.set(habItem, value);
                }
            }.bind(this))
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
        let myURL = this._getURL(`/rest/items`);
        const response = syncRequest('GET', myURL);
        this._log.debug(`Online request for openHAB (${myURL}) resulted in status code ${response.statusCode}`);
        return response.statusCode === 200;
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
                    returnedValue = body;
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
                let value = response.body.toString('ASCII');
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
            body: command
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
        let myURL = this._getURL(`/rest/items`, `recursive=false&fields=name%2Ctype`);
        const response = syncRequest('GET', myURL);
        if (response.statusCode !== 200) {
            return new Error(`Unable to get items: HTTP code ${response.statusCode}!`);
        } else {
            const items = JSON.parse(response.body);
            if(items.length > 0) {
                this._log.debug(`Got array with ${items.length} item/s`);
                items.forEach(function(item) {
                    this._log.debug(`Got item ${item.name} of type ${item.type}, adding to type cache`);
                    this._typeCache.set(item.name, item.type);
                }.bind(this));
            } else {
                this._log.error(`Received no items from openHAB, unable to sync states!`);
            }
        }
    }

    syncItemValues() {
        this._log.info(`Syncing all item values from openHAB`);
        let myURL = this._getURL(`/rest/items`, `recursive=false&fields=name%2Cstate`);
        const response = syncRequest('GET', myURL);
        if (response.statusCode !== 200) {
            return new Error(`Unable to get item values: HTTP code ${response.statusCode}!`);
        } else {
            const items = JSON.parse(response.body);
            if(items.length > 0) {
                this._log.debug(`Got array with ${items.length} item/s`);
                items.forEach(function(item) {
                    if(this._subscriptions[item.name] !== undefined) {
                        this._log.debug(`Got item ${item.name} with value ${item.state}, adding to value cache`);
                        this._valueCache.set(item.name, item.state);
                    } else {
                        this._log.warn(`Got item ${item.name} with value ${item.state}, not adding to value cache, since it is not linked to homebridge!`);
                    }
                }.bind(this));
            } else {
                this._log.error(`Received no items from openHAB, unable to sync states!`);
            }
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
        for(var key in this._subscriptions) {
            let myURL = this._getURL('/rest/events',`topics=smarthome/items/${key}/statechanged`);
            this.startSubscriptionForItem(myURL, key, this._subscriptions[key]);
        }
    }

    startSubscriptionForItem(url, habItem, callbacks) {
        const CLOSED = 2;

        this._log.debug(`Starting subscription for ${habItem} with ${callbacks.length} subscribed characteristic(s)`);
        let source = new EventSource(url);

        source.onmessage = function (eventPayload) {
            let eventData = JSON.parse(eventPayload.data);
            if (eventData.type === "ItemStateChangedEvent") {
                let item = eventData.topic.replace("smarthome/items/", "").replace("/statechanged", "");
                let value = JSON.parse(eventData.payload).value;
                callbacks.forEach(function(callback){
                    callback(value, item);
                });
                this._valueCache.set(item, value);
            }
        }.bind(this);
        source.onerror = function (err) {
            if (err.message) {
                let msg;
                if (err.status) {
                } else {
                    msg = err.message;
                }
                if (source.readyState === CLOSED || err.status === 404) {
                    msg = `Subscription closed for ${habItem}, trying to reconnect in 1sec...`;
                    setTimeout(function () {
                        this._log.warn(`Trying to reconnect subscription for ${habItem}...`);
                        source.close();
                        this.startSubscriptionForItem(url, habItem, callbacks);
                    }.bind(this), 1000);
                }
                this._log.error(msg);
                callbacks.forEach(function(callback){
                    callback(new Error(msg));
                });
            }
        }.bind(this);
    }
}

module.exports = {OpenHAB};