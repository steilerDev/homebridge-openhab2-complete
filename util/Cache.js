
const EventEmitter = require('events').EventEmitter;

class Cache extends EventEmitter {
    constructor(log, ttl, monitorInterval) {
        super();
        this._log = log;
        this._data = {};
        if(ttl) {
            this._ttl = ttl;
        }
        if(monitorInterval) {
            this._monitor = setInterval(this._checkCacheForExpiredItems.bind(this), monitorInterval);
        }
    }

    get(key) {
        return this._getValueAndCheckExpiration(key)
    }

    set(key, value) {
        if(this._ttl) {
            let ttl = Cache._now() + this._ttl;
            this._data[key] = {
                expires: ttl,
                value: value
            }
        } else {
            this._data[key] = {
                value: value
            };
        }
    }

    del(key) {
        this._data[key] = {};
    }

    exists(key) {
        return this._data[key] && Object.keys(this._data[key]).length > 0;
    }

    _checkCacheForExpiredItems() {
        this._log.debug(`Checking cache for expired items`);
        Object.keys(this._data).forEach(this._getValueAndCheckExpiration.bind(this));
    }

    _getValueAndCheckExpiration(key) {
        if(key) {
            this._log.debug(`Checking cache for ${key}`);
            let thisData = this._data[key];
            if(thisData && Object.keys(thisData).length > 0) {
                if(Cache._isExpired(thisData)) {
                    this._log.debug(`Value for key ${key} is expired, cleaning & emitting event`);
                    this._data[key] = {};
                    this.emit('expired', key);
                }
                this._log.debug(`Returning value (${thisData.value}) for key ${key} `);
                return thisData.value;
            } else {
                this._log.debug(`No value stored for key ${key}`);
                return null;
            }
        } else {
            this._log.warn(`Unable to get cache, no key specified!`);
        }
    }

    static _isExpired(data) {
        return data.expires && data.expires <= Cache._now();
    }

    static _now() {
        return Date.now();
    }

}

module.exports = {Cache};
