import "Proxy.sol";
import "Lib.sol";

contract SharedController {
    Proxy public proxy;
    address[] public userAddresses;
    mapping( bytes32 => mapping( address => bool )) public txSigners;
    
    modifier onlyUsers() { if(Lib.findAddress(msg.sender, userAddresses) != -1) _}
    modifier onlyProxy() { if(address(proxy) == msg.sender) _}

    function SharedController(address proxyAddress, address[] _userAddresses) {
        proxy = Proxy(proxyAddress);
        userAddresses = _userAddresses;
    }

    function signTx(address destination, uint value, bytes data) onlyUsers {
        bytes32 txHash = sha3(destination,value,data);
        txSigners[txHash][msg.sender] = true;
        if (collectedSignatures(txHash) >= neededSignatures()){
            resetSignatures(txHash); //so another set of sigs is needed to replay tx
            forward(destination, value, data); 
        }
    }
    
    function changeController(address newController) onlyProxy{
        proxy.transfer(newController);
        suicide(newController);
    }
    function addUser(address newUser) onlyProxy{
        if(Lib.findAddress(newUser, userAddresses) == -1){
            userAddresses.push(newUser);
        }
    }
    function removeUser(address oldUser) onlyProxy{
        uint lastIndex = userAddresses.length - 1;
        int i = Lib.findAddress(oldUser, userAddresses);
        if(i != -1){
            Lib.removeAddress(uint(i), userAddresses);
        }
    }

    function collectedSignatures(bytes32 txHash) returns (uint signatures){
        for(uint i = 0 ; i < userAddresses.length ; i++){
            if (txSigners[txHash][userAddresses[i]]){
                signatures++;
            }
        }
    }
    function neededSignatures() returns (uint){ return userAddresses.length/2 + 1; }
    function getUserAddresses() returns(address[]){return userAddresses;}

    function forward(address destination, uint value, bytes data) private {
        proxy.forward(destination, value, data);
    }
    function resetSignatures(bytes32 txHash) private {
        for(uint i = 0 ; i < userAddresses.length ; i++){
            txSigners[txHash][userAddresses[i]] = false;
        }
    }
}
