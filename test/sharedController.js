var HookedWeb3Provider = require('hooked-web3-provider');
var lightwallet = require('eth-signer');

const ProviderEngine = require('web3-provider-engine')
const CacheSubprovider = require('web3-provider-engine/subproviders/cache.js')
const FixtureSubprovider = require('web3-provider-engine/subproviders/fixture.js')
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js')
const VmSubprovider = require('web3-provider-engine/subproviders/vm.js')
const HookedWalletSubprovider = require('web3-provider-engine/subproviders/hooked-wallet.js')
const NonceSubprovider = require('web3-provider-engine/subproviders/nonce-tracker.js')
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js')
const Web3Subprovider = require('web3-provider-engine/subproviders/web3.js')
const Web3 = require('web3');
// const Web3 = require('web3');

var engine = new ProviderEngine()


// var cryptoJS = require('crypto-js');
// var ethereumjsUtil = require('ethereumjs-util');
// var BigNumber = require('BigNumber.js');

// console.log(rand.toString(16));
// console.log(r1, r2, r3, r4, r5);
var Signer = lightwallet.signer;
var HDSigner = lightwallet.signers.HDSigner;
var Phrase = lightwallet.generators.Phrase;
var ProxySigner = lightwallet.signers.ProxySigner;
var regularWeb3Provider = web3.currentProvider;


// const ProviderEngine = require('web3-provider-engine')
// const FixtureSubprovider = require('web3-provider-engine/subproviders/fixture.js')
// const NonceSubprovider = require('web3-provider-engine/subproviders/nonce-tracker.js')
// var engine = new ProviderEngine()

function wait(seconds){
  return new Promise(function(resolve, reject){
    setTimeout(resolve, seconds*1000);
  })
}

function createAccounts(funderAccount, numAccounts) {
  return new Promise(function(resolve, reject){
    var finishedCallbacks = 0;
    var signers = [];
    for(var i = 0 ; i < numAccounts ; i++){
      console.log("here", i);
      signers[i] = new Signer(new HDSigner(Phrase.toHDPrivateKey('tackle crystal drum type spin nest wine occur humor grocery worry pottery')));
      web3.eth.sendTransaction({from: funderAccount, to: signers[i].getAddress(), value: web3.toWei('1', 'ether')}, ((e, r) => { 
        console.log("there");
        finishedCallbacks++;
        console.log(finishedCallbacks);
        if(finishedCallbacks == numAccounts ) { 
          for(var j = 0 ; j < numAccounts ; j++){
            console.log(signers[j].getAddress());
          }
          resolve(signers); 
        } 
      }));
    }
  })
}

function createProxies(signers, controllers, proxies, accounts) {
  return new Promise(function(resolve, reject){
    var finishedCallbacks = 0;


    
    var engine = new ProviderEngine()
    // for(var i = 0 ; i < signers.length ; i++){
      engine.addProvider(new HookedWalletSubprovider(signers[0]))
    // }
      engine.addProvider(new Web3Subprovider(web3.currentProvider))
      engine.start();
      web3 = new Web3(engine);
      // web3.setProvider(engine);


    // var web3Prov = new HookedWeb3Provider({
    //   host: 'http://localhost:8545',
    //   transaction_signer: signers[0],
    // });
    // web3.setProvider(web3Prov);

    // IdentityFactory.setProvider(engine);
    signers[0].getAccounts((e, r)=>{console.log("RESULT",r)});
    console.log("ADDRESS",signers[0].getAddress())
    identityFactory = IdentityFactory.deployed();
    identityFactoryFilter = identityFactory.IdentityCreated({});

      console.log("SIGNER0", signers[0].signTransaction);
      console.log("SIGNER1", signers[0].getAccounts);
      // console.log("ENGINE", engine);
    for(var i = 0 ; i < signers.length ; i++){
      console.log("getting to here");
      identityFactory.CreateProxyWithControllerAndRecovery(signers[i].getAddress(),[],0,0, {from: signers[0].getAddress()})
      .then(() => {
        console.log("but not getting to here");
        identityFactoryFilter.get((error, logs) => {
          finishedCallbacks++;

          if(finishedCallbacks == signers.length) { 
            for(var j = 0 ; j < signers.length ; j++){
              controllers[j] = RecoverableController.at(logs[j].args.controller);
              proxies[j] = Proxy.at(logs[j].args.proxy);
              console.log("s:", signers[j].getAddress(), "\tp", proxies[j].address, "\tc", controllers[j].address);
            }
            resolve(); 
          } 
        })
      })
    }
  })
}

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

  before((done) => {
    //create a bunch of accounts and fund them
    createAccounts(accounts[0], 10).then((result) => {
      signers = result;

      sharedIdentityFactory = SharedIdentityFactory.deployed();
      identityFactory = IdentityFactory.deployed();
      testRegistry = TestRegistry.deployed();

      identityFactoryFilter = identityFactory.IdentityCreated({});
      sharedIdentityFactoryFilter = identityFactory.IdentityCreated({});
      return createProxies(signers, controllers, proxies, accounts)})
    .then(() => {
      done();
    })
  });

  it("Create proxy, controller, and recovery contracts", (done) => {
    identityFactory.CreateProxyWithControllerAndRecovery(signers[1].getAddress(),[],0,0, {from: accounts[1]})
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
              transaction_signer: new Signer(new ProxySigner(proxies[0].address, signers[1], sharedController.address))
            });
            TestRegistry.setProvider(web3ProxyProvider);

            // web3ProxyProvider = new HookedWeb3Provider({
            //   host: 'http://localhost:8545',
            //   transaction_signer: new Signer(new ProxySigner(proxies[1].address, signers[1], sharedController.address))
            // });
            // TestRegistry.web3.addProvider(web3ProxyProvider);

            testRegistry.register(0x123abc, {from: proxies[0].address})
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
  //   identityFactory.CreateProxyWithControllerAndRecovery(signers[1].getAddress(),[],0,0, {from: accounts[1]})
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
