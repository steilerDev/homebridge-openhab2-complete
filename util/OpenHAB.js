'use strict';

const {URL} = require('url');
const request = require('request');
const syncRequest = require('sync-request');
const EventSource = require('eventsource');j

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
    }

    getState(habItem, callback) {
        this._url.pathname = `/rest/items/${habItem}/state`;
        request({
            url: this._url.href,
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
            }
        })
    }

    getStateSync(habItem) {
        this._url.pathname = `/rest/items/${habItem}/state`;
        const response = syncRequest('GET', this._url.href);
        if (response.statusCode === 404) {
            return new Error(`Item does not exist!`);
        } else if (!(response.body)) {
            return new Error(`Unable to retrieve state`);
        } else {
            return response.body.toString('ASCII');
        }
    }

    sendCommand(habItem, command, callback) {
        this._url.pathname = `/rest/items/${habItem}`;
        request({
            url: this._url.href,
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
        this._url.pathname = `/rest/items/${habItem}/state`;
        request({
                url: this._url.href,
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
        this._url.pathname = `/rest/items/${habItem}`;
        const response = syncRequest('GET', this._url.href);
        if (response.statusCode === 404) {
            return new Error(`Item does not exist!`);
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
        this._url.path = `/rest/events?topics=smarthome/items/${habItem}/statechanged`;
        let source = new EventSource(this._url.href);
        source.onmessage = function(eventPayload) {
            let eventData = JSON.parse(eventPayload.data);
            if(eventData.type === "ItemStateChangedEvent") {
                let item = eventData.topic.replace("smarthome/items/", "").replace("/statechanged", "");
                let value = JSON.parse(eventData.payload).value;
                callback(value, item);
            }
        };
        source.onerror = function (err) {
            callback(new Error(err.message));
        };
        this._url.path = "";
        return source;
    }
}

module.exports = {OpenHAB};