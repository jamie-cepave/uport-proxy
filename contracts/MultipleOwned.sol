// A base Owned contract

contract MultipleOwned {
    mapping( address => uint ) public owners;
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
    }

    function revoke(address _owner) onlyOwner {
        delete owners[_owner];
    }

}
