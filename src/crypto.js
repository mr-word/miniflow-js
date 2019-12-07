const blake2 = require('blake2')
const nacl = require('tweetnacl')

function newKeyPair () {
  return nacl.sign.keyPair()
}
function hash (buffer) {
  if (buffer === undefined) throw new Error('hash: undefined buffer argument')
  if (buffer == '' || buffer == [] || buffer == 0) {
    return Buffer.alloc(32)
  }
  var h = blake2.createHash('blake2b', { digestLength: 32 })
  h.update(buffer)
  return h.digest()
}

function sign (buffer, privkey, pubkeycheck) {
  throw new Error('unimplemented')
}

function scry (buffer, sig, pubkey) {
  throw new Error('unimplemented')
}

module.exports = { hash, sign, scry, newKeyPair }
