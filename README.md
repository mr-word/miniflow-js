big and fast UTXO machine with tiny spec
---

Miniflow is a high throughput blockchain architecture characterizied by `O(log(n))` span (parallel-time) validation.

Miniflow is a POC and sister network for [manaflow](https://word.site/2019/11/26/manaflow).

Manaflow will include user-specified transition logic (smart contracts) while maintaining log-span validation and pushing it to its logical limit.

### key dependencies

* RLP for serialization
* libp2p for networking
* blake2b for hashing
* secp256k1 for signing (TODO: consider Ed25519, and Schnorr for multisig)
* immutable-js for hygiene

### agenda

```
.js sequential validator
.go concurrent validator
.k  sequential validator, concurrent validator, and proof they are equivalent
.rs very big and fast 8]
```

### compare and contrast list

A litmus test for log-span validation is: can you validate transactions in reverse order?
This does not not necessarily mean you have to reverse computations, since you have the input.
You only need to return pass/fail validation for a sequence/block/chain,
processing transactions in reverse order (taking constant lookahead, e.g. 1 input).
If you have this property, you also need to be able to define a reduction step that strictly decreases the size of your transient working state.
During strictly reverse validation, this working set might grow very large before shrinking.

"State" refers to *state that can impact consensus logic*. We consider "dapps" that use a chain as a message bus without impacting L1 validation (or just check multisignatures and injected data) to be trivial and irrelevant to this list.


#### Bitcoin / Classic UTXO

* **Validation**: `O(log(n))`. It wants to be big!
* **Spec** Some scattered attempts at a rigorous spec. Completing a spec should be feasible and it is surprising one does not exist.
* **State Logic** No global state accessible to script, and even UTXO state is local. See [this post](https://word.site/2019/11/20/utxo-vs-global-state/) if you have too much bitcoin and you're thinking "but bitcoin opcodes *are* turing complete!".
* **State Rent** None, state persists indefinitely
* **Thin Proofs**: Can prove "necessarily spent" / "possibly unspent", but **cannot prove "necessarily unspent"**.
* **Consensus**: Heavily throttled (10 min) POW, optimized to keep thin clients thin.

#### Classic Extra-State UTXO (e.g. Namecoin)

All the same properties as Bitcoin, but includes a finite set of new pass/fail validation for a chain.

This highlights that Bitcoin is a UTXO chain whose entire function is cash.

If any introduced operation results in possible transitions that can't be validated in log-span, the chain becomes O(n) again.
 
#### EVM

* **Validation**: `O(n)`, or `O(n/k)` for k shards, which is still `O(n)`. For some applications, synchronization overhead may dominate at scale, which would give `O(k^2 * n/k) == O(k*n)` time (with a much smaller hidden constant from the sharding).
* **Spec**: Semi-formal specification with many implementations. Some nearly complete formal specifications in K, though they lag behind EVM updates.
* **State Logic**: Full user-defined arbitrary state transitions that can read and write to other
* **State Rent**: None (yet, but team Ethereum considers it necessary)
* **Thin Proofs**: Can prove arbitrary state at arbitrary block.
* **Consensus**: ~15s POW, which is a generous multiple of average network round-trip time.

#### EOS

* **Validation**: `O(n)`, and optimized for it. Message passing architecture for async control flow in principle allows fairly straightforward transition to multi-threading to achieve `O(n/k)`.
* **Spec**: One fairly volatile implementation, no formal spec.
* **State Logic**: Reads are available for entire state, writes only for state items pre-declared in transaction.
* **State Rent**: ??
* **Consensus** DPOS, ~3s block times. Fast finality. Has characteristics similar to classic BFT partial solutions.

#### IELE

Very similar to EVM, with a focus on formal verification.

* **Validation**: `O(n)`
* **Spec**: Formal-spec-first design.
* **State Logic**: ??
* **State Rent**: ??
* **Consensus**: ??

#### Miniflow

* **Validation**: `O(log(n))`
* **Spec**: Tiny spec formalized ASAP
* **State Logic**: Outputs can be locked by, or require, a UTXO to be present at the (logical) moment it is validated. Application-wise, besides coin-like "fungible garbage regions", there are non-fungible regions, and conditions that can be built from need/lock circuits.
* **State rent**: Simple [double-life fee](https://word.site/2019/12/03/double-life-fee/) for rent.
* **Consensus**: Pure [dpow](https://word.site/2019/11/12/dynamic-pow/)

#### Manaflow

* **Validation**: `O(log(n))`
* **Spec**: Spec first / concurrently with POC
* **State Logic**: Output scripts have access to the entire evaluated transaction pair for each input (the input and its consumed output), as well as the header and some other shardlet context.
* **State Rent**: Model based [double-life fee](https://word.site/2019/12/03/double-life-fee/) with script having some control
* **Consensus**: Assuming it is proven to work, pure [dpow](https://word.site/2019/11/12/dynamic-pow/)


## note dump

* architecture could be easily adopted for UTXO systems with finite 'standard transaction' types
* * the only (logical) structure maintained by miniflow is a set of non-fungible contiguous regions (splittable but not joinable) and fungible garbage regions (which make a coin-like)
* * * Nevertheless, this is a minimal demonstration of threading consensus-validated state through UTXO, specifically *without maintaining an auxiliary state DB*
* the only user-specified validation condition is plain (multi)signature, "locks", and "needs"
* * UTXO locks mean that it cannot be spent while another UTXO exists, and needs means that it requires another UTXO to exist to be spent (both allow K of N quorum, giving circuits)
* * 'locks' are implemented with 'NTXI' reducer similar to RTXI. Still does not require auxiliary state DB, just more fields in shardlet reducer.
* * 'needs' same concept but requires UTXO (without spending it) to be able to spend. **Still all log span**.
