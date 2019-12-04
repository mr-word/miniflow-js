const blake2 = require('blake2')

function hash (buffer) {
  var h = blake2.createHash('blake2b')
  h.update(buffer)
  return h.digest()
}

module.exports = { hash }
