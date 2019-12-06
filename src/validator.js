const debug = require('debug')('miniflow:validator')
const immutable = require('immutable')
const { BlockTree } = require('../src/blocktree.js')
const ab2h = require('array-buffer-to-hex')
const h2ab = require('hex-to-array-buffer')


class ValidationError extends Error {}

function need (condition, explanation) {
  if (!condition) throw new ValidationError(explanation)
}

class Validator {
  constructor () {
    this.getTime = () => Date.now()
  }

  // returns state ref or throw error
  evaluate (state, block, headerOnly = false) {
    debug('evaluate given state %O and block %O', state, block)

    // Header conditions
    // prev, prevTotalWork, (actroot), miner, time, work
    const header = block.header
    const now = this.getTime()
    need(header.time <= now, `header.time (${header.time}) cannot be in the future (after ${now})`)
    need(state.hasHeader(ab2h(header.prev)), 'evaluate given a state, but it does not contain block.prev')
    // assert work > latest.work / 2
    // assert block.prevTotalWork = latest.prevTotalWork + latest.work
    // miner field: no check

    // actroot at end of block (or during)

    state.addHeader(header)

    if (headerOnly) {
        return state
    }

    // Actions
    const actions = block.actions
    for (var a = 0; a < actions.length; a++) {
      var action = actions[a]
      for (var i = 0; i < action.inputs; i++) {
        var input = inputs[i]
        // check sig
        // match RTXI/UTXO
      }
      for (var o = 0; o < action.outputs; o++) {
        var output = outputs[o]
        // check logic
      }
      // Action aggregate conditions
    }

    // Block aggregate conditions
    const root = header.actroot
    block.remerk()
    need(header.actroot == root, 'merkle root must verify')

    return state
  }
}

module.exports = { Validator, ValidationError }
