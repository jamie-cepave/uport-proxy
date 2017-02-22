pragma solidity ^0.4.4;
import "RecoverableController.sol";

contract RecoveryQuorum {
    RecoverableController public controller;

    address[] public delegateAddresses; // needed for iteration of mapping
    mapping (address => Delegate) public delegates;
    struct Delegate{
        uint deletedAfter; // delegate exists if not 0
        uint pendingUntil;
        address proposedUserKey;
    }

    event RecoveryEvent(string action, address initiatedBy);

    modifier onlyUserKey(){ if (msg.sender == controller.userKey()) _; }

    function RecoveryQuorum(address _controller, address[] _delegates){
        controller = RecoverableController(_controller);
        for(uint i = 0; i < _delegates.length; i++){
            delegateAddresses.push(_delegates[i]);
            delegates[_delegates[i]] = Delegate({proposedUserKey: 0x0, pendingUntil: 0, deletedAfter: 31536000000000});
        }
    }
    function signUserChange(address proposedUserKey) {
        if(delegateRecordExists(delegates[msg.sender])) {
            delegates[msg.sender].proposedUserKey = proposedUserKey;
            changeUserKey(proposedUserKey);
            RecoveryEvent("signUserChange", msg.sender);
        }
    }
    function changeUserKey(address newUserKey) {
        if(collectedSignatures(newUserKey) >= neededSignatures()){
            controller.changeUserKeyFromRecovery(newUserKey);
            for(uint i = 0 ; i < delegateAddresses.length ; i++){
                //remove any pending delegates after a recovery
                if(delegates[delegateAddresses[i]].pendingUntil > now){ 
                    delegates[delegateAddresses[i]].deletedAfter = now;
                }
                delete delegates[delegateAddresses[i]].proposedUserKey;
            }
        }
    }

    function replaceDelegates(address[] delegatesToRemove, address[] delegatesToAdd) onlyUserKey{
        for(uint i = 0 ; i < delegatesToRemove.length ; i++){
            removeDelegate(delegatesToRemove[i]);
        }
        garbageCollect();
        for(uint j = 0 ; j < delegatesToAdd.length ; j++){
            addDelegate(delegatesToAdd[j]);
        }
        RecoveryEvent("replaceDelegates", msg.sender);
    }
    function collectedSignatures(address _proposedUserKey) returns (uint signatures){
        for(uint i = 0 ; i < delegateAddresses.length ; i++){
            if (delegateHasValidSignature(delegates[delegateAddresses[i]]) && delegates[delegateAddresses[i]].proposedUserKey == _proposedUserKey){
                signatures++;
            }
        }
    }

    function getAddresses() constant returns (address[]){ return delegateAddresses; }

    function neededSignatures() returns (uint){
        uint currentDelegateCount; //always 0 at this point
        for(uint i = 0 ; i < delegateAddresses.length ; i++){
            if(delegateIsCurrent(delegates[delegateAddresses[i]])){ currentDelegateCount++; }
        }
        return currentDelegateCount/2 + 1;
    }
    function addDelegate(address delegate) private {
        if(!delegateRecordExists(delegates[delegate]) && delegateAddresses.length < 15) {
            delegates[delegate] = Delegate({proposedUserKey: 0x0, pendingUntil: now + controller.longTimeLock(), deletedAfter: 31536000000000});
            delegateAddresses.push(delegate);
        }
    }
    function removeDelegate(address delegate) private {
        if(delegates[delegate].deletedAfter > controller.longTimeLock() + now){ 
            //remove right away if they are still pending
            if(delegates[delegate].pendingUntil > now){ 
                delegates[delegate].deletedAfter = now;
            } else{
                delegates[delegate].deletedAfter = controller.longTimeLock() + now;
            }
        }
    }
	function garbageCollect() private {
		address[] memory notGarbage = new address[](delegateAddresses.length);
		uint len = 0;

		for (uint i = 0; i < delegateAddresses.length; i++) {
			if (delegateIsDeleted(delegates[delegateAddresses[i]])) {
				delegates[delegateAddresses[i]] = Delegate({proposedUserKey: 0, pendingUntil: 0, deletedAfter: 0});
			} else {
				notGarbage[len++] = delegateAddresses[i];
			}
		}

		delegateAddresses = notGarbage;
		delegateAddresses.length = len;
	}
    function delegateRecordExists(Delegate d) private returns (bool){
        return d.deletedAfter != 0;
    }
    function delegateIsDeleted(Delegate d) private returns (bool){
        return d.deletedAfter <= now; //doesnt check record existence
    }
    function delegateIsCurrent(Delegate d) private returns (bool){
        return delegateRecordExists(d) && !delegateIsDeleted(d) && now > d.pendingUntil;
    }
    function delegateHasValidSignature(Delegate d) private returns (bool){
        return delegateIsCurrent(d) && d.proposedUserKey != 0x0;
    }
}
