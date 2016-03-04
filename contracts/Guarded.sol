// The core proxy facade
// - is owned by a user or implementation contract
// - only forwards transactions for its owner

import "MultipleOwned";

contract Guarded is MultipleOwned {
  address public guard;

  modifier onlyGuard(){ if (msg.sender == guard) _ }

  function setGuard(address _guard) onlyOwner {
    guard = _guard;
  }

  function proposeOwner(address owner) onlyGuard {
    // proposed owner is only valid after a day, allowing existing owners to revoke it
    owners[owner] = block.timestamp + 1 days;
    Authorized(msg.sender, owner);
  }
}
