// A base Owned contract

contract MultipleOwned {
    mapping( address => uint ) public owners;
    event Authorized(address addedBy, address newOwner);
    event Revoked(address revokedBy, address newOwner);

    modifier onlyOwner(){ if (isOwner(msg.sender)) _ }
    modifier ifOwner(address sender) { if(isOwner(sender)) _ }

    function MultipleOwned(){
        owners[msg.sender] = block.timestamp;
    }

    function isOwner(address addr) public returns(bool) {
      var validFrom = owners[addr];
      return validFrom > 0 && validFrom <= block.timestamp;
    }

    function authorize(address _owner) onlyOwner {
        owners[_owner] = block.timestamp;
        Authorized(msg.sender, _owner);
    }

    function revoke(address _owner) onlyOwner {
        delete owners[_owner];
        Revoked(msg.sender, _owner);
    }

}
