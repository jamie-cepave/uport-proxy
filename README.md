# Proxy

- Core contract is: [Proxy.sol](contracts/Proxy.sol)
- MultiProxy contract is: [MultiProxy.sol](contracts/MultiProxy.sol)
- GuardedProxy contract is: [GuardedProxy.sol](contracts/GuardedProxy.sol)
- Default implementation used is: [Implementation.sol](examples/Implementation.sol)

Example custom implementations:

- [ChallengePeriod.sol](examples/ChallengePeriod.sol)
- [Revokable.sol](examples/Revokable.sol)
- [OneOfN.sol](examples/OneOfN.sol)
- [Refunder.sol](examples/Refunder.sol)

## Changelog

- Explore "option 2" validator proxy.
- Add some example validators.
- Switch from validator proxy to single implementor proxy.
- Explore second `forward` function signature which takes signed transactions
- Make sure proxy forward is only ever called by owner
- Make sure all forwarded txs from proxy have proxy as msg.sender
- Added MultipleOwned Proxy for uPort identities that can be controlled by multiple devices
- Added GuardedProxy which can have an optional "Guard" a contract or account that can add new accounts to proxy

## Todos

- Fix ecrecover (bytes/bytes32) in implementations
- Calculate gas used for refunder implementation
- Make challengePeriod example only apply to implementation change
