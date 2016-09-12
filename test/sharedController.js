var HookedWeb3Provider = require('hooked-web3-provider');
var lightwallet = require('eth-signer');

var Signer = lightwallet.signer;
var HDSigner = lightwallet.signers.HDSigner;
var Phrase = lightwallet.generators.Phrase;
var ProxySigner = lightwallet.signers.ProxySigner;
var regularWeb3Provider = web3.currentProvider;

const LOG_NUMBER_1 = 1234;
const LOG_NUMBER_2 = 2345;

contract("Uport proxy integration tests", (accounts) => {
  var identityFactory;
  var sharedIdentityFactory;

  var signers = [];
  var controllers = [];
  var proxies = [];

  var sharedController;
  var sharedProxy;

  var identityFactoryFilter;
  var sharedIdentityFactoryFilter;
  var testRegistry;

  before(() => {
    signers[0] = new HDSigner(Phrase.toHDPrivateKey("tackle crystal drum type spin nest wine occur humor grocery worry pottery"));
    signers[1] = new HDSigner(Phrase.toHDPrivateKey("tree clock fly receive mirror scissors away avoid seminar attract wife holiday"));

    web3.eth.sendTransaction({from: accounts[0], to: signers[0].getAddress(), value: web3.toWei('1', 'ether')});
    web3.eth.sendTransaction({from: accounts[0], to: signers[1].getAddress(), value: web3.toWei('1', 'ether')});

    sharedIdentityFactory = SharedIdentityFactory.deployed();
    identityFactory = IdentityFactory.deployed();
    testRegistry = TestRegistry.deployed();

    identityFactoryFilter = identityFactory.IdentityCreated({});
    sharedIdentityFactoryFilter = identityFactory.IdentityCreated({});
  });

  it("Create proxy, controller, and recovery contracts", (done) => {
    identityFactory.CreateProxyWithControllerAndRecovery(signers[0].getAddress(),[],0,0, {from: accounts[1]})
    .then(() => {
      return identityFactory.CreateProxyWithControllerAndRecovery(signers[1].getAddress(),[],0,0, {from: accounts[1]})})
    .then(() => {
      return identityFactoryFilter.get((error, logs) => {
        controllers[0] = RecoverableController.at(logs[0].args.controller);
        proxies[0] = Proxy.at(logs[0].args.proxy);
        controllers[1] = RecoverableController.at(logs[1].args.controller);
        proxies[1] = Proxy.at(logs[1].args.proxy);
        // console.log("controllers:", controllers, " proxies ", proxies);
        sharedIdentityFactory.CreateProxyWithSharedController([proxies[0].address, proxies[1].address], {from: accounts[1]})
        .then(() => {
          return sharedIdentityFactoryFilter.get((error, logs) => {
            sharedController = SharedController.at(logs[0].args.controller);
            sharedProxy = Proxy.at(logs[0].args.proxy);

            var web3ProxyProvider = new HookedWeb3Provider({
              host: 'http://localhost:8545',
              transaction_signer: new Signer(new ProxySigner(proxies[0].address, signers[0], sharedController.address))
            });
            Proxy.setProvider(web3ProxyProvider);
            RecoverableController.setProvider(web3ProxyProvider);
            console.log(web3.eth.Eth);
            console.log("A", proxies[0], "B", proxies[0].address);
            web3.setProvider(web3ProxyProvider);
            // web3.eth.sendTransaction({from: proxies[0].address, to:0x123, value: 12345})
            // .then(() => {
               web3.eth.getBalance(signers[0].getAddress(), (error, response) => {
              console.log("BALBABLBALBALBALBALBAL", response.toNumber());
              done();
                
               })//})
              // return web3.eth.getBalance(proxies[0].address)})
            // .then((balance) => {
            // });
          });
        });
      });
    });
  });

  // it("Create proxy, controller, and recovery contracts", (done) => {
  //   identityFactory.CreateProxyWithControllerAndRecovery(signers[0].getAddress(),[],0,0, {from: accounts[1]})
  //   .then(() => {
  //     return identityFactory.CreateProxyWithControllerAndRecovery(signers[1].getAddress(),[],0,0, {from: accounts[1]})})
  //   .then(() => {
  //     return identityFactoryFilter.get((error, logs) => {
  //       controllers[0] = RecoverableController.at(logs[0].args.controller);
  //       proxies[0] = Proxy.at(logs[0].args.proxy);
  //       controllers[1] = RecoverableController.at(logs[1].args.controller);
  //       proxies[1] = Proxy.at(logs[1].args.proxy);
  //       // console.log("controllers:", controllers, " proxies ", proxies);
  //       sharedIdentityFactory.CreateProxyWithSharedController([proxies[0].address, proxies[1].address], {from: accounts[1]})
  //       .then(() => {
  //         return sharedIdentityFactoryFilter.get((error, logs) => {
  //           sharedController = SharedController.at(logs[0].args.controller);
  //           sharedProxy = Proxy.at(logs[0].args.proxy);
  //           done();
  //         });
  //       });
  //     });
  //   });
  // });
});
