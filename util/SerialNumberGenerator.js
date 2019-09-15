'use strict';

const crypto = require('crypto');

function generate(name, type) {
    const hash = crypto.createHash('sha512');
    hash.update(name);
    hash.update(type);


    const s = hash.digest('hex');
    let i = -1;

    return 'xxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, () => s[++i]).toUpperCase();
}

module.exports = {generate};
