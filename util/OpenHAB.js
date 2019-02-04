'use strict';

const {URL} = require('url');
const request = require('request');
const syncRequest = require('sync-request');
const EventSource = require('eventsource');
const clone = require('clone');
const cache = require('nano-cache');

const cacheTTL = 5 * 60 * 1000;

class OpenHAB {

    constructor(hostname, port) {
        if(hostname.startsWith("http://") || hostname.startsWith("https://")) {
            this._url = new URL(hostname);
        } else {
            this._url = new URL(`http://${hostname}`);
        }
        if (port !== undefined) {
            this._url.port = port
        }
        this._cache = new cache({
            ttl: cacheTTL
        });
        this._subscriptions = {};
    }

    isOnline() {
        let myURL = clone(this._url);
        myURL.pathname = `/rest/items`;
        const response = syncRequest('GET', myURL.href);
        return response.statusCode === 200;
    }

    getState(habItem, callback) {
        if(this._cache.get(habItem)) {
            console.log(`Getting value for ${habItem} from the cache`);
            callback(null, this._cache.get(habItem));
        } else {
            let myURL = clone(this._url);
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
                        this._cache.set(habItem, body);
                    }
                }.bind(this))
        }
    }

    getStateSync(habItem) {
        if(this._cache.get(habItem)) {
            console.log(`Getting value for ${habItem} from the cache`);
            return this._cache.get(habItem);
        } else {
            let myURL = clone(this._url);
            myURL.pathname = `/rest/items/${habItem}/state`;
            const response = syncRequest('GET', myURL.href);
            if (response.statusCode === 404) {
                return new Error(`Item does not exist!`);
            } else if (!(response.body)) {
                return new Error(`Unable to retrieve state`);
            } else {
                let value = response.body.toString('ASCII');
                this._cache.set(habItem, value);
                return value;
            }
        }
    }

    sendCommand(habItem, command, callback) {
        if(this._cache.get(habItem)) {
            console.log(`Invalidating cache for ${habItem}`);
            this._cache.del(habItem);
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
        if(this._cache.get(habItem)) {
            console.log(`Invalidating cache for ${habItem}`);
            this._cache.del(habItem);
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

    subscribe(habItem, callback) {
        if(!this._subscriptions[habItem]) {
            this._subscriptions[habItem] = [];
        }
        console.log(`Adding subscription for ${habItem}`);
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

        console.log(`Adding subscription for ${habItem}`);
        let source = new EventSource(url);

        source.onmessage = function (eventPayload) {
            let eventData = JSON.parse(eventPayload.data);
            if (eventData.type === "ItemStateChangedEvent") {
                let item = eventData.topic.replace("smarthome/items/", "").replace("/statechanged", "");
                let value = JSON.parse(eventData.payload).value;
                callbacks.forEach(function(callback){
                    callback(value, item);
                });
                this._cache.set(item, value);
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
                        console.log(`Trying to reconnect subscription for ${habItem}...`);
                        source.close();
                        this.startSubscriptionForItem(url, habItem, callbacks);
                    }.bind(this), 1000);
                }
                callbacks.forEach(function(callback){
                    callback(new Error(msg));
                });
            }
        }.bind(this);
    }
}

module.exports = {OpenHAB};