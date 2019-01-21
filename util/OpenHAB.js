'use strict';

const url = require('url');
const request = require('request');
const syncRequest = require('sync-request');
const clone = require('clone');

class OpenHAB {

    constructor(hostname, port) {
        this._url = new URL(hostname);
        if (port !== undefined) {
            this._url.port = port
        }
    }

    getState(habItem, callback) {
        let myUrl = clone(this._url);
        myUrl.pathname = `/rest/items/${habItem}/state`;
        request({
            url: myUrl.href,
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
        let myUrl = clone(this._url);
        myUrl.pathname = `/rest/items/${habItem}`;
        request({
            url: myUrl.href,
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
        let myUrl = clone(this._url);
        myUrl.pathname = `/rest/items/${habItem}/state`;
        request({
                url: myUrl.href,
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
        let myUrl = clone(this._url);
        myUrl.pathname = `/rest/items/${habItem}`;
        const response = syncRequest('GET', myUrl.href);
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
}

module.exports = OpenHAB;