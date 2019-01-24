'use strict';

const crypto = require('crypto');

function generate(name) {
    const sha1sum = crypto.createHash('sha1');
    sha1sum.update(name);

    const s = sha1sum.digest('hex');
    let i = -1;

    return 'xxxxxxxxxxxx'.replace(/[x]/g, () => s[++i]).toUpperCase();
}

module.exports = {generate};
