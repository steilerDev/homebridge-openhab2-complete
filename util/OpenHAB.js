'use strict';

const url = require('url');
const request = require('request');

class OpenHAB {

    constructor(hostname, port) {
        this._url = new URL(hostname);
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

    sendCommand(habItem, command, callback) {
        this._url.pathname = `/rest/items/${habItem}`;
        request({
            url: this._url.href,
            method: 'POST',
            body: command
        },
        function(error, response, body) {
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
        function(error, response, body) {
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
    getItemType(habItem, callback) {
        this._url.pathname = `/rest/items/${habItem}`;
        request({
            url: this._url.href,
            method: 'GET'
        }, function(error, response, body) {
            if(error) {
                callback(error);
            } else {
                if (response.statusCode === 404) {
                    callback(new Error(`Item does not exist!`));
                } else {
                    const type = JSON.parse(body).type;
                    if (!(type)) {
                        callback(new Error(`Unable to retrieve type`));
                    } else {
                        callback(null, type);
                    }
                }
            }
        })
    }
}

module.exports = OpenHAB;