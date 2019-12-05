const immutable = require('immutable')
const debug = require('debug')('miniflow:state')
const ab2h = require('array-buffer-to-hex')
const h2ab = require('hex-to-array-buffer')

const ZERO = ab2h(new ArrayBuffer(32))

class State {
  constructor (tree, state, head) {
    this._lock = false
    this._back = tree
    this.S = state
    this.head = head
  }

  assertUnlocked () {
    if (this._lock) throw new Error('This state ref has already been commit')
  }

  addUTXO (txid, idx) {
    this.assertUnlocked()
    this.S.set(['utxo', txid, idx], this.head)
  }

  delUTXO (txid, idx) {
    this.assertUnlocked()
    this.S.delete(['utxo', txid, idx], this.head)
  }

  addBlock (header, block) {
    this.assertUnlocked()
    this.S.set(['block', header], block)
  }

  pushHeader (header) {
    this.assertUnlocked()
    this.S.set(['header', header], header)
    this.head = header
  }

  addAction (actID, action) {
    this.assertUnlocked()
    this.S.set(['action', actID], [this.head, action])
  }

  commit () {
    this.assertUnlocked()
    this._back.snapshots = this._back.snapshots.set(this.head, this)
    return this.head
  }
}

class BlockTree {
  constructor (validator) {
    // ['header', HEADER] -> bool
    // ['utxo', acthash, idx] -> CONFHEADER
    // ['block', HEADER] -> block
    // ['action', acthash] -> CONFHEADER
    this.multistate = immutable.Map()

    this.validator = validator

    // header -> State
    this.snapshots = immutable.Map()
    const state0 = new State(this, this.multistate, ZERO)
    state0.pushHeader(ZERO)
    this.latest = state0.commit()
  }

  isUnspent (header, actID, idx) {
    const s = this.snapshots.get(header)
    if (!s) throw new Error(`no such header in blocktree: ${header})`)
    return this.multistate.has(['utxo', actID, idx])
  }

  checkout (header) {
    debug('checking out header', header)
    debug('  checkout out from snapshot map %O', this.snapshots)
    return this.snapshots.get(header)
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
    // return this.latest = stateAfter
    return stateAfter
  }

  forceInsert (block, afterHeader) {
    debug('forceInsert block into blocktree: %O', block)
    debug('afterHeader : %s', afterHeader)
    const state = this.checkout(afterHeader)
    const HEADER = block.header.hashID()
    state.addBlock(HEADER, block)
    state.pushHeader(HEADER)
    block.actions.forEach((action) => {
      state.addAction(action.hashID(), action)
      action.outputs.forEach((output, idx) => {
        state.addUTXO(action.hashID(), idx)
      })
    })
    state.commit()
    if (afterHeader == this.latest) { // TODO no, check work
      this.latest == HEADER
    }
  }
}

module.exports = { State, BlockTree }
