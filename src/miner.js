const BN = require('bn.js')
const debug = require('debug')('miniflow:miner')
const ab2h = require('array-buffer-to-hex')
const h2ab = require('hex-to-array-buffer')

const { hash } = require('../src/crypto.js')

function padleft (s, n, c) {
  return c.repeat(n - s.length) + s
}

function work (mixhash, difficulty) {
  debug(`data  ${mixhash}`)
  debug(`tuff  ${padleft(difficulty.toString('hex'), 64, '0')}`)
  let w
  let i = 0
  const t = Date.now()
  let n = t
  mixhash = Buffer(h2ab(mixhash))
  while (true) {
    i += 1
    n += 1
    const nbuf = new Buffer(32)
    nb = (new BN(n)).toBuffer()
    nbuf.set(nb, 32 - nb.length)
    //        debug(nbuf)
    work = hash(Buffer.concat([mixhash, nbuf]))
    //        debug(work)
    worknum = new BN(work)
    //        debug('worknum ', padleft(worknum.toString(16), 64, "0"))
    //        debug('tuff    ', padleft(difficulty.toString(16), 64, "0"))

    if (worknum.lt(difficulty)) {
      debug('done working')
      debug(`took ${n - t} hashes`)
      debug(`fuzz ${ab2h(nbuf)}`)
      debug(`pow  ${ab2h(work)}`)
      return nbuf
    }
  }
}

module.exports = { work }
