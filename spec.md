Data
---

```
VAR256 is a nullable 256-bit unsigned integer represented by a variable number of bytes, from 0 to 32.
It is not a variable-length encoding. The length is given by the surrounding RLP encoding. It is a UINT with N bytes, where 0 bytes means null.

BLOB is an arbitrary array of bytes. Again, the length is given by the surrounding RLP encoding, and again a length of 0 is a null blob.

HASH is 32 bytes
PUBKEY is 32 bytes
SIGNATURE is 64 bytes

// UTXO Tag
UTag: RLP(
    actionHash: HASH(Action)
  , outputIndex: VAR256
)

// Familiar alias for RTXI case
Input = UTag

Output: RLP(
    left: VAR256
  , right: VAR256
  , data: BLOB 
  , lockQuorum: VAR256
  , needQuorum: VAR256
  , keyQuorum: VAR256
  , locks: [UTag]
  , needs: [UTag]
  , pubkeys: [BIGNUM]
)

Action: RLP(
  , validSince: VAR256
  , validUntil: VAR256
  , inputs: [Input]
  , outputs: [Output]
  , requireHeader: HASH(Header)
  , signatures: [SIGNATURE(HASH(RLP(validSince,...,pubkeys)))] // sign hash of above fields RLP encoded in order (not raw prefix)
  , extraData: BLOB // inserted by block producer
)

Header: RLP(
    prev: HASH(Header)
  , actroot: HASH(...) // merkle tree
  , xtrs: VAR256
  , miner: PUBKEY
  , time: BIGNUM
  , fuzz: VAR256
  , work: HASH(HASH(prev,...,time), fuzz) // hash raw concatenation, not RLP encoding
)

Block: RLP(
    header: Header
  , txs: [Action]
)
```

Validation
---

This state definition and pseudocode are a sequential implementation of the validation conditions, but the validation conditions themselves are in O(log(n)) span. Watch this space for a mathematical (set-oriented) validation definition, and for concurrent pseudocode with supporting transient data structures.

### Chain State

The chain state is best understood as an immutable data structure providing key->value maps, with references to snapshots of this state saved for each block header.
The parenthesized header argument `(Header ->)` at the start of some signatures is included to emphasize that each lookup has an implicit 'atBlock' argument, even though it is normally ignored for clarity.

```
// These are proper hash tables, and can be defined without regard for state or validation. The state itself has only references to hashes.
allHeaders: HeaderHash -> Header
  allBlocks: HeaderHash -> Block  (indirect hash ID)
allActions: ActionHash -> Action

// This is a map from a UTXO to which header it was confirmed in. (*In this branch*. In different histories, a transaction may have been confirmed in different blocks.)
utxos: (Header ->) UTXO -> HEADER  

// This is a set of which headers are in the chain. (*In this branch*.)
pastHeaders: (Header ->) -> Header -> bool
```

### State -> Block -> State

This code takes a block, and inserts it after its parent in the blocktree if it is valid. It is not concerned with determining which of many valid states is the 'latest'. Again, it is an implementation, and there is a parallel algorithm that is equivalent.

```
let block be given
let header = block.header

prevHeader = header.prev
FAIL IF prevHeader not in allHeaders // No known previous header
FAIL IF prevHeader not in allBlocks // No known block for header - maybe a thin client?

FAIL IF header.time > clock() // wall clock time
FAIL IF header.time <= prevHeader.time

let mixHash = hash(...) // see data definitions
FAIL IF header.work != hash(mixHash, header.fuzz)

FAIL IF header.work > prev.header.work * (3 / 2) // literal numeric values ("must be at least 2/3 as hard")

FAIL IF header.actroot != block.actions.merkelize() // regular (dense binary) merkle tree from list


FOR (action) IN (block.actions)
    FAIL IF action.validSince > header.time
    FAIL IF action.validUntil <= header.time

    FAIL IF requireHeader not in pastHeaders // not allHeaders, *this branch's* headers

    FAIL IF any signature fails from action.signatures // not related to spending logic, reject invalid signatures outright
    // Note which fields are signed -- nodes can mutate extraData (`mdata`) on transactions. But whole trx is merkelized.

    var garbageIn = 0
    var intervals = {} // this interval matching itself be parallelized internally for huge transactions
    FOR (input) IN (action.inputs)
        let inAction = allActions(input.actID)
        let inOutput = inAction.outputs[input.idx]

        check key quorum (multisignature)
        check locks quorum (tag must not exist in UTXO)
        check needs quorum (tag must exist in UTXO)

        if left == 0
            garbageIn += (right - left)
        intervals[inOutput.right] = inOutput.left // left has multiple values at 0, so map this way
        STATE: REMOVE UTXO(input) // utag

    var garbageOut = 0
    var outervals = 0
    FOR (output) IN (action.outputs)
        FAIL IF output.right <= output.left
        FAIL IF data.size > (output.right - output.left) // a novelty? or a real thing?

        outervals[output.right] = output.left

        STATE: ADD UTXO(output, header.hashID())

    checkOnlySplit(intervals, outervals) // aware of slide-to-zero / garbage
    checkNetZero(intervals, outervals)
    DHT: ADD ACTION

STATE: ADD HEADER (this branch's set ref)
DHT: ADD HEADER
DHT: ADD BLOCK
```
