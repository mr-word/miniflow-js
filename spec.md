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
  , outpubIndex: VAR256
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
  , locks: [UTag]
  , needs: [UTag]
  , pubkeys: [PUBKEY]
  , signatures: [SIGNATURE(HASH(RLP(validSince,...,pubkeys)))] // sign hash of above fields RLP encoded in order (not raw prefix)
  , extraData: [] // inserted by block producer
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
