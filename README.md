big and fast UTXO machine with tiny spec
---

* can be validated in logarithmic parallel time
* very small formal specification compared to bitcoin clones, EVM, and even [IELE](https://github.com/runtimeverification/iele-semantics)
* the (logical) structure maintained by the UTXO is a set of non-fungible contiguous regions (splittable but not joinable) and fungible garbage regions (which make a coin-like)
* the only user-specified validation condition is plain (multi)signature
* [double-life fee](https://word.site/2019/12/03/double-life-fee/) for simple state rent: UTXO expire when they are at least half as old as the chain itself
* [dpow](https://word.site/2019/11/12/dynamic-pow/) - no difficulty/TBT - thin client header chain not throttled. Each block must be at least 1/2 as difficult as last block.
* special case of [manaflow](https://word.site/2019/11/26/manaflow/) which interprets output data as code -- can be log-time validated if local eval context is appropriately limited and global writes go to special reducer
* architecture could be easily adopted for UTXO systems with finite 'standard transaction' types
* * alloced/garbage regions are the only UTXO logic in miniflow
* * * Nevertheless, this is a minimal demonstration of threading consensus-validated state through UTXO

### key dependencies

* RLP for serialization
* libp2p for networking
* blake2b for hashing
* secp256k1 for signing (TODO: consider Ed25519)

### agenda

```
.js sequential validator
.go concurrent validator
.k  sequential validator, concurrent validator, and proof they are equivalent
.rs very big and fast 8]
```
