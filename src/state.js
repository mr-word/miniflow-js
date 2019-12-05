const immutable = require('immutable')
const debug = require('debug')('miniflow:state')
const ab2h = require('array-buffer-to-hex')
const h2ab = require('hex-to-array-buffer')

const ZERO = ab2h(new ArrayBuffer(32))

class State {
  constructor (head, headers, UTXO) {
    this.head = head
    this.headers = headers // set<header>
    this.UTXO = UTXO // [txid,opidx] -> header
  }

  // (txid,idx)
  addUTXO (outTag) {
    this.UTXO = this.UTXO.set(outTag, this.head)
  }

  delUTXO (outTag) {
    this.UTXO = this.UTXO.delete(outTag)
  }

  pushHeader (header) {
    this.headers = this.headers.add(header)
    this.head = header
  }
}

class BlockTree {
  constructor (validator) {
    this.validator = validator
    this.allBlocks = new Map()
    this.allActions = new Map()

    // header -> State
    this.snapshots = immutable.Map()
    const state0 = new State(ZERO, immutable.Set(), immutable.Map())
    this.snapshots = this.snapshots.set(ZERO, state0)
    this.latest = ZERO
  }

  isUnspent (header, outTag) {
    const s = this.snapshots.get(header)
    if (!s) throw new Error(`no such header in blocktree: ${header})`)
    return s.UTXO.has(outTag)
  }

  checkout (header) {
    debug('checking out header', header)
    debug('  checkout out from snapshot map %O', this.snapshots)
    return this.snapshots.get(header)
  }

  commit (header, state) {
    this.snapshots = this.snapshots.set(header, state)
  }

  insert (block) {
    debug('state snapshots: %O', this.snapshots)
    debug('inserting block into blocktree: %O', block)

    this.allBlocks.set(block.header.hashID(), block)
    block.actions.forEach((action) => {
      this.allActions.set(action.hashID(), action)
    })

    const state = this.checkout(h2ab(block.header.prev))
    if (!state) throw new Error('No such block.prev exists in the blocktree')
    const stateAfter = this.validator.evaluate(state, block)
    this.snapshots.set(block.header.hashID(), stateAfter)
    // determine latest
    return this.latest = stateAfter
  }

  forceInsert (block, prev = 'latest') {
    debug('forceInsert block into blocktree: %O', block)
    prev = prev === 'latest' ? this.latest : prev
    debug('prev header: %s', prev)
    const state = this.checkout(prev)
    const HEADER = block.header.hashID()
    this.allBlocks.set(HEADER, block)
    state.pushHeader(HEADER)
    block.actions.forEach((action) => {
      this.allActions.set(action.hashID(), action)
      action.outputs.forEach((output, idx) => {
        state.addUTXO(action.getOutputTag(idx))
      })
    })
    this.commit(HEADER, state)
    if (prev == this.latest) {
      this.latest == HEADER
    }
  }
}

module.exports = { State, BlockTree }
