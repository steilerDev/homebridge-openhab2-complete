'use strict';

const url = require('url');
const request = require('request');

class HTTPHandler {

    constructor(hostname, port, log) {
        this._log = log;
        this._url = new URL(hostname);
        if (port !== undefined) {
            this._log.info(`Using non-standart port ${port}`);
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
            callback(error, response, body)
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
            callback(error, response, body);
        })
    }

    updateState(habItem, state, callback) {
        this._url.pathname = `/rest/items/${habItem}/state`;
        request({
                url: this._url.href,
                method: 'PUT',
                body: body
        },
        function(error, response, body) {
            callback(error, response, body);
        })

    }
}

module.exports = HTTPHandler;