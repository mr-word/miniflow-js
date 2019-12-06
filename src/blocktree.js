const immutable = require('immutable')
const L = immutable.List
const debug = require('debug')('miniflow:state')
const ab2h = require('array-buffer-to-hex')
const h2ab = require('hex-to-array-buffer')

const ZERO = ab2h(new ArrayBuffer(32))

class State {
  constructor(multistate) {
    this.multistate = multistate
  }

  isUnspent (txid, idx) {
    return this.multistate.has(L(['utxo', txid, idx]))
  }

  hasHeader (header) {
    return this.multistate.has(L(['header', header]))
  }

  addHeader (header) {
    debug('adding header %O', header)
    const prev = header.prev
    const prevEntry = this.multistate.get(L(['header', ab2h(prev)]))
    if (!prevEntry) throw new Error('prev header does not exist in blocktree')
    this.multistate = this.multistate.set(L(['header', header.hashID()]), header)
  }

  addUTXO (txid, idx) {
    debug('adding utxo %O', [txid, idx])
    this.multistate = this.multistate.set(L(['utxo', txid, idx]), true)
  }

  delUTXO (txid, idx) {
    debug('deleting utxo %O', [txid, idx])
    this.multistate = this.multistate.delete(L(['utxo', txid, idx]))
  }

  addBlock (block) {
    debug('adding block %O', block)
    this.multistate = this.multistate.set(L(['block', block.header.hashID()]), block)
  }

  addAction (action) {
    debug('adding action %O', action)
    this.multistate = this.multistate.set(L(['action', action.hashID]), action)
  }

  insertBlock (block) {
    debug('insertBlock into blocktree: %O', block)

    const prevHeader = ab2h(block.header.prev)
    if (!this.hasHeader(prevHeader)) {
      throw new Error(`trying to applyBlock but no known state for prevHeader ${prevHeader}`)
    }

    this.addHeader(block.header)
    this.addBlock(block)
    block.actions.forEach((action) => {
      this.addAction(action)
      action.outputs.forEach((output, idx) => {
        debug('adding utxo idx %s output %O action %O', idx, output, action)
        this.addUTXO(action.hashID(), idx)
      })
      action.inputs.forEach((input) => {
        debug('deleting utxo given in input %O from action %O', input, action)
        const ACTION = ab2h(input.action)
        if (ACTION != '') {
          this.delUTXO(ACTION, input.index.toNumber()) // TODO value types
        } else {
          this.delUTXO(action.hashID(), input.index.toNumber())
        }
      })
    })

  }

}

class BlockTree {
  constructor () {
    this.multistate = immutable.Map()
    this.refs = new Map()

    this.multistate = this.multistate.set(L(['header', ZERO]), ZERO)
    this.refs.set(ZERO, this.multistate)
  }

  // future: lockless transparent reference giving `addHeader`, etc
  checkout (header) {
    if (!this.refs.has(header)) {
      throw new Error(`trying to checkout a header that doesn't exist: ${header}`)
    }
    return new State(this.refs.get(header))
  }

  commit (header, state) {
    if (this.refs.has(header)) throw new Error('state already commit for this header')
    debug('committing stage to latest hash %O: %O', header, state)
    this.refs.set(header, state.multistate)
  }

}

module.exports = { BlockTree }
