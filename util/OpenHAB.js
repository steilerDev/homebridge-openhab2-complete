'use strict';

const {URL} = require('url');
const request = require('request');
const syncRequest = require('sync-request');
const EventSource = require('eventsource');
const clone = require('clone');
const cache = require('nano-cache');

// 30 mins ttl for cached item states
const valueCacheTTL = 30 * 60 * 1000;
// 10 mins ttl for cached item types, because those are only required during startup
const typeCacheTTL = 10 * 60 * 1000;

class OpenHAB {

    constructor(hostname, port, log) {
        if(hostname.startsWith("http://") || hostname.startsWith("https://")) {
            this._url = new URL(hostname);
        } else {
            this._url = new URL(`http://${hostname}`);
        }
        if (port !== undefined) {
            this._url.port = port
        }
        this._valueCache = new cache({
            ttl: valueCacheTTL,
            compress: false
        });

        this._valueCache.on('del', function (habItem) {
            if(this._valueCache.isTTLExpired(habItem)) {
                this._log.debug(`Item ${habItem}'s state was cleared from the cache, getting the current value`);
                this._getStateWithoutCache(habItem, function (error, value) {
                    if (error) {
                        this._log.error(`Unable to get ${habItem}'s new state: ${error.message}`);
                    } else {
                        this._log.debug(`Updating cache entry for ${habItem} with new value ${value}`);
                        this._valueCache.set(habItem, value);
                    }
                }.bind(this))
            }
        }.bind(this));

        this._typeCache = new cache({
            compress: false
        });
        this._subscriptions = {};
        this._log = log;
    }

    isOnline() {
        let myURL = clone(this._url);
        myURL.pathname = `/rest/items`;
        const response = syncRequest('GET', myURL.href);
        this._log.debug(`Online request for openHAB (${myURL.href}) resulted in status code ${response.statusCode}`);
        return response.statusCode === 200;
    }

    getState(habItem, callback) {
        if(this._valueCache.get(habItem)) {
            this._log.debug(`Getting value for ${habItem} from the cache`);
            callback(null, this._valueCache.get(habItem));
        } else {
            this._log.warn(`Getting value for ${habItem} from openHAB, because no cached state exists`);
            this._getStateWithoutCache(habItem, callback);
        }
    }

    _getStateWithoutCache(habItem, callback) {
        let myURL = clone(this._url);
        this._log.debug(`Getting value for ${habItem} from openHAB`);
        myURL.pathname = `/rest/items/${habItem}/state`;
        request({
                url: myURL.href,
                method: 'GET'
            },
            function (error, response, body) {
                if(error) {
                    callback(error);
                } else if (response.statusCode === 404) {
                    callback(new Error(`Item does not exist!`));
                } else if (!(body)) {
                    callback(new Error(`Unable to retrieve state`));
                } else {
                    callback(null, body);
                    this._valueCache.set(habItem, body);
                }
            }.bind(this))
    }

    getStateSync(habItem) {
        if(this._valueCache.get(habItem)) {
            this._log.debug(`Getting value for ${habItem} from the cache`);
            return this._valueCache.get(habItem);
        } else {
            this._log.warn(`Getting value for ${habItem} from openHAB, because no cached state exists`);
            let myURL = clone(this._url);
            myURL.pathname = `/rest/items/${habItem}/state`;
            const response = syncRequest('GET', myURL.href);
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
        if(this._valueCache.get(habItem)) {
            setTimeout(function() {
                this._log.debug(`Invalidating cache for ${habItem}`);
                this._valueCache.del(habItem);
            }.bind(this), 1000);
        }
        let myURL = clone(this._url);
        myURL.pathname = `/rest/items/${habItem}`;
        request({
            url: myURL.href,
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
        if(this._valueCache.get(habItem)) {
            setTimeout(function() {
                this._log.debug(`Invalidating cache for ${habItem}`);
                this._valueCache.del(habItem);
            }.bind(this), 1000);
        }
        let myURL = clone(this._url);
        myURL.pathname = `/rest/items/${habItem}/state`;
        request({
                url: myURL.href,
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
        if(this._typeCache.get(habItem)) {
            this._log.debug(`Getting type for ${habItem} from the cache`);
            return this._valueCache.get(habItem);
        } else {
            this._log.debug(`Getting type for ${habItem} from openHAB, because no cached state exists`);
            let myURL = clone(this._url);
            myURL.pathname = `/rest/items/${habItem}`;
            const response = syncRequest('GET', myURL.href);
            if (response.statusCode !== 200) {
                return new Error(`Unable to get item: HTTP code ${response.statusCode}!`);
            } else {
                const type = JSON.parse(response.body).type;
                if (!(type)) {
                    return new Error(`Unable to retrieve type`);
                } else {
                    return type;
                }
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
        let myURL = clone(this._url);
        myURL.pathname = '/rest/events';

        for(var key in this._subscriptions) {
            myURL.search = `topics=smarthome/items/${key}/statechanged`;
            this.startSubscriptionForItem(myURL.href, key, this._subscriptions[key]);
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