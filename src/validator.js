const debug = require('debug')('miniflow:validator')
const immutable = require('immutable')
const { BlockTree } = require('../src/blocktree.js')
const ab2h = require('array-buffer-to-hex')
const h2ab = require('hex-to-array-buffer')
const BN = require('bn.js')

class ValidationError extends Error {}

function need (condition, explanation) {
  if (!condition) throw new ValidationError(explanation)
}

class Validator {
  constructor () {
    this.now = 0
  }

  getTime() { return Date.now() }

  // returns state ref or throw error
  evaluate (state, block, headerOnly = false) {
    if(!typeof(block) == 'Block') {
        throw new TypeError(`evaluate: not a block: %O`, block)
    }
    this.now = this.getTime()
    const header = block.header
    debug('evaluate given state %O and block %O', state, block)
    debug(`header %O`, header)

    need(header.time <= this.now, `header.time (${header.time}) cannot be in the future (after ${this.now})`)
    const HEAD = header.hashID()
    const PREV = ab2h(header.prev)
    need(state.hasHeader(PREV), 'evaluate given a state, but it does not contain block.prev')
    const prev = state.getHeader(PREV)
    debug(`evaluated header's prev: %s, prevHeader %O`, PREV, prev)

    const OVER256 = (new BN(2)).pow(new BN(256))
    const prevWorkNum = OVER256.sub(new BN(Buffer(prev.work)))
    const prevTotalWork = prev.prevTotalWork.add(prevWorkNum.mod(OVER256))
    debug(`prevWorkNum ${prevWorkNum.toString(16)} prevTotalWork ${prevTotalWork}`)
    debug(`header.prevTotalWork ${header.prevTotalWork}`)
    need(header.prevTotalWork.eq(prevTotalWork), `header's prevTotalWork doesn't correctly add prev.work`)

    const headWorkNum = OVER256.sub(new BN(Buffer(header.work)))
    debug(`headWorkNum ${headWorkNum.toString(16)}`)

    // dpow
    need(headWorkNum >= prevWorkNum * 2, 'not enough work')

    const root = header.actroot
    block.remerk()
    need(header.actroot == root, 'merkle root must verify')

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
