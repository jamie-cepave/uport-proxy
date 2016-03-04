// The core proxy facade
// - is owned by a user or implementation contract
// - only forwards transactions for its owner

import "MultipleOwned";

contract MultiProxy is MultipleOwned {
    function forward(address destination, uint value, bytes data) onlyOwner {
    	// If a contract tries to CALL or CREATE a contract with either
    	// (i) insufficient balance, or (ii) stack depth already at maximum (1024),
    	// the sub-execution and transfer do not occur at all, no gas gets consumed, and 0 is added to the stack.
    	// see: https://github.com/ethereum/wiki/wiki/Subtleties#exceptional-conditions
        if (!destination.call.value(value)(data)) {
            throw;
        }
    }
}
