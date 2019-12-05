const debug = require('debug')('miniflow:validator')
const immutable = require('immutable')
const { State } = require('../src/state.js')

class ValidationError extends Error {}

function need (condition, explanation) {
  if (!condition) throw new ValidationError(explanation)
}

class Validator {
  constructor () {
    this.getTime = () => Date.now()
  }

  // returns (err, [addUTXO, useUTXO])
  evaluate (state, block) {
    debug('evaluate given state %O and block %O', state, block)
    const header = block.header

    const now = this.getTime()
    need(header.time <= now, `header.time (${header.time}) cannot be in the future (after ${now})`)

    // assert work > latest.work / 2
    // assert block.prevTotalWork = latest.prevTotalWork + latest.work

    need(state.headers.has(header.prev), 'evaluate given a state, but it does not contain block.prev')

    block.remerk()
    need(block.header == header, 'merkle root must verify')

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
      // action aggregate conditions
    }
    // block aggregate conditions
    return state
  }
}

module.exports = { Validator, ValidationError }
