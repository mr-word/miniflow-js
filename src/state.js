const immutable = require('immutable')
const debug = require('debug')('miniflow:state')

class State {
  constructor(head, headers, UTXO) {
    this.head = head
    this.headers = headers
    this.UTXO = UTXO
  }
}

class MultiState {
  constructor (validator) {
    this.validator = validator
    this.allBlocks = new Map()
    this.allActions = new Map()

    this._headers = new immutable.Set()
    this._UTXO = new immutable.Set()

    // header -> State
    this.snapshots = new Map()
  }

  init (bang) {
    debug('init')
    const HEADER = bang.header.hashID()
    this.allBlocks.set(HEADER, bang)
    this.allActions.set(bang.actions[0].hashID(), bang.actions[0])

    this._headers = this._headers.add(HEADER)
    this._UTXO = this._UTXO.add(bang.actions[0].getOutputTag(0))
    this._UTXO = this._UTXO.add(bang.actions[0].getOutputTag(1))

    let state = new State(HEADER, this._headers, this._UTXO)
    this.snapshots.set(HEADER, state)
    this.latest = HEADER
  }

  insert (block) {
    debug(`state snapshots: %O`, this.snapshots)
    debug(`inserting block into multistate: %O`, block)
    let state = this.snapshots.get(block.header.prev)
    if (!state) throw new Error(`No such block.prev exists in the multistate`)
    const res = this.validator.evaluate(state, block)
    const err = res[0]; const diff = res[1]
    if (err) throw err
    // apply diff
    // determine latest
    return this.latest
  }
}

module.exports = { State, MultiState }
