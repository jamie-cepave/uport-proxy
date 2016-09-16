var HookedWeb3Provider = require('hooked-web3-provider');
var lightwallet = require('eth-signer');
var cryptoJS = require('crypto-js');
var ethereumjsUtil = require('ethereumjs-util');

var Signer = lightwallet.signer;
var HDSigner = lightwallet.signers.HDSigner;
var Phrase = lightwallet.generators.Phrase;
var ProxySigner = lightwallet.signers.ProxySigner;
var regularWeb3Provider = web3.currentProvider;


const ProviderEngine = require('web3-provider-engine')
const FixtureSubprovider = require('web3-provider-engine/subproviders/fixture.js')
const NonceSubprovider = require('web3-provider-engine/subproviders/nonce-tracker.js')
var engine = new ProviderEngine()


const LOG_NUMBER_1 = 1234;
const LOG_NUMBER_2 = 2345;

contract("sharedController integration tests", (accounts) => {
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

  var randomAddress = "0xf235aa56ddccd7096bda02acfb361ec38b313e27";

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
        sharedIdentityFactory.CreateProxyWithSharedController([proxies[0].address, proxies[1].address], {from: accounts[1]})
        .then(() => {
          return sharedIdentityFactoryFilter.get((error, logs) => {
            sharedController = SharedController.at(logs[0].args.controller);
            sharedProxy = Proxy.at(logs[0].args.proxy);

            var web3ProxyProvider = new HookedWeb3Provider({
              host: 'http://localhost:8545',
              transaction_signer: new Signer(new ProxySigner(proxies[0].address, signers[0], sharedController.address))
            });
            TestRegistry.setProvider(web3ProxyProvider);

            // web3ProxyProvider = new HookedWeb3Provider({
            //   host: 'http://localhost:8545',
            //   transaction_signer: new Signer(new ProxySigner(proxies[1].address, signers[1], sharedController.address))
            // });
            // TestRegistry.web3.addProvider(web3ProxyProvider);

            testRegistry.register(12345, {from: proxies[0].address})
            .then(() => {
              return testRegistry.registry.call(proxies[0].address)})
            .then((thing) => {
                console.log(thing.toNumber());
                done();
            });
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
