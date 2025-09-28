const crypto = require('crypto');

function sha256Base64(str) {
  return crypto.createHash('sha256').update(str).digest('base64');
}

function randomToken(len = 32) {
  return crypto.randomBytes(len).toString('base64url');
}

module.exports = { sha256Base64, randomToken };
