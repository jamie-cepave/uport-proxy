import "SharedController.sol";

contract SharedIdentityFactory {
    event IdentityCreated(
        address indexed creator,
        address proxy,
        address controller);

    mapping(address => address) public senderToProxy;

    function CreateProxyWithSharedController(address[] userKeys) {
        Proxy proxy = new Proxy();
        SharedController controller = new SharedController(proxy, userKeys);
        proxy.transfer(controller);

        IdentityCreated(msg.sender, proxy, controller);
        senderToProxy[msg.sender] = proxy;
    }
}

