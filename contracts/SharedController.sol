import "Proxy.sol";

contract SharedController {
    // uint    public version;
    // Proxy   public proxy;

    // address[] public userAddresses;
    // mapping( address => bool ) isUser;
    // mapping( address => mapping( address => bool )) txSigners;

    // modifier onlyUsers() { if(isUser[msg.sender]) _}

    // function SharedController(address proxyAddress, address[] _userAddresses) {
    //     version = 2; //collaborative ID;
    //     proxy = Proxy(proxyAddress);
    //     userAddresses = _userAddresses
    //     for (uint i = 0 ; i < userAddresses.length ; i++){ isUser[userAddresses[i]] = true; }
    // }

    // function signTx(address destination, uint value, bytes data) onlyUsers {
    //     bytes txHash = sha3(destination + value + data);
    //     txSigners[txHash][msg.sender] = true;
    //     if (collectedSignatures(txHash) >= neededSignatures()){ forward(destination, value, data) }
    // }

    // function forward(address destination, uint value, bytes data) private {
    //     proxy.forward(destination, value, data);
    // }

    // function collectedSignatures(bytes txHash) returns (uint signatures){
    //     for(uint i = 0 ; i < userAddresses.length ; i++){
    //         if (txSigners[txHash][userAddresses[i]]){
    //             signatures++;
    //         }
    //     }
    // }
    // function neededSignatures() returns (uint){ return userAddresses.length/2 + 1; }
}

