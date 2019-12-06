minibang
---

The primordial action is the unique well-formed action which consumes its own output and emits (0,0).

Block 0 has 1 action:
  Action 0 has 1 input and creates 2 spendable outputs (out of 3 total outputs):
    * Input 0 consumes output 0 of the transaction itself, which is also a reference to the primordial output under [null-point hash]().
    - Output 0 emits emits (0,0), which is the output consumed by input 0.
    + Output 1 emits (0,1)
    + Output 2 emits [1-2^256-1].

In other words, the null point simultaneously comes into existence and separates into abstract and concrete spaces by double spending itself.

The 1st block's producer can consume (0,1) and [1,2^256-1]
