const debug = require('debug')('miniflow:validator')

const immutable = require('immutable')
const ab2h = require('array-buffer-to-hex')
const h2ab = require('hex-to-array-buffer')
const BN = require('bn.js')

const { Varnum } = require('../src/data.js')
const { hash } = require('../src/crypto.js')

class ValidationError extends Error {}

function need (condition, explanation) {
  if (!condition) throw new ValidationError(explanation)
}

class Validator {
  constructor () {
    this.now = 0
  }

  getTime () { return Date.now() }

  // returns state ref or throw error
  evaluate (state, block, headerOnly = false) {
    if (!typeof (block) == 'Block') {
      throw new TypeError('evaluate: not a block: %O', block)
    }
    this.now = this.getTime()
    const header = block.header
    debug('evaluate given state %O and block %O', state, block)
    debug('header %O', header)

    need(Varnum.fromBuffer(header.time).lt(new Varnum(this.now)),
        `header.time (${header.time}) cannot be in the future (after ${this.now})`)
    const HEAD = header.hashID()
    const PREV = ab2h(header.prev)
    need(state.hasHeader(PREV), 'evaluate given a state, but it does not contain block.prev')
    const prev = state.getHeader(PREV)
    debug('evaluated header\'s prev: %s, prevHeader %O', PREV, prev)

    const OVER256 = (new BN(2)).pow(new BN(256))
    const prevWorkNum = OVER256.sub(new BN(Buffer(prev.work)))

    const headWorkNum = OVER256.sub(new BN(Buffer(header.work)))
    debug(`headWorkNum ${headWorkNum.toString(16)}`)

    // dpow
    need(headWorkNum.lt(prevWorkNum.mul(new BN(3)).div(new BN(2))), 'not enough work')

    const mix = header.mixHash()
    const fuzz = header.fuzz
    const workload = [Buffer.from(mix, 'hex'), Buffer.from(fuzz, 'hex')]
    const trueHash = ab2h(hash(Buffer.concat(workload)))
    debug(`trueHash ${trueHash}`)
    debug(`givenHash ${header.work.toString('hex')}`)
    need(header.work.toString('hex') === trueHash, 'proof of work does not validate')

    const root = header.root
    block.remerk()
    need(ab2h(header.root) == ab2h(root), 'merkle root must verify')

    state.addHeader(header)

    if (headerOnly) {
      return state
    }

    // Actions
    const actions = block.actions
    for (var a = 0; a < actions.length; a++) {
      var action = actions[a]
      // check ttl
      // check sig
      // match RTXI/UTXO (spent outputs)
      // reject NTXI-UTXO (locks/needs)
      // require YTXI-UTXO (locks/needs)
      for (var i = 0; i < action.inputs; i++) {
        var input = inputs[i]
      }
      for (var o = 0; o < action.outputs; o++) {
        var output = outputs[o]
      }
      // Action aggregate conditions
    }

    return state
  }
}

module.exports = { Validator, ValidationError }
