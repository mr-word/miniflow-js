Output: RLP(
    left: BIGNUM // region logic (0 means fungible garbage region)
  , right: BIGNUM // region logic ('amount' when fungible garbage)
  , data: BLOB // ignored by validation
  , quorum: BIGNUM // multisig: K of len(pubkeyset)
  , pubkeyidx: [BIGNUM] // indices into set of pubkeys in transaction
)

Input: RLP(
    actionHash: HASH(ACTION)
  , outputIndex: BIGNUM
)

Action: RLP(
    confirmHeader: HASH(HEADER)
  , validSince: BIGNUM
  , validUntil: BIGNUM
  , inputs: [INPUT]
  , outputs: [OUTPUT]
  , pubkeys: [PUBKEY] // to de-duplicate pubkeys from outputs
// mix = HASH(confirmHeader,validSince,validUntil,inputs,outputs,pubkeys)
// signatures: [SIGNATURE(mix)]
  , signatures: [SIGNATURE(HASH(confirmHeader,validSince,validUntil,inputs,outputs,pubkeys))]
)

Header: RLP(
// mix = HASH(noWorkHeader) = HASH(prevHash, txroot, pubkey, time)
// work = HASH(mix)
    work: HASH(HASH(HASH(HEADER), MERKLEROOT, PUBKEY, BIGNUM))
  , prevHash: HASH(HEADER)
  , txroot: MERKLEROOT(txtree)
  , miner: PUBKEY
  , time: BIGNUM
)

Block: RLP(
    header: HEADER
  , txs: [ACTION]
)


