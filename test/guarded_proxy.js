var expect          = require('chai').expect;
var Promise         = require('bluebird');
var Web3            = require('web3');
var web3            = new Web3();
var web3prov        = new web3.providers.HttpProvider('http://localhost:8545');
web3.setProvider(web3prov);

var pudding         = require('ether-pudding');
pudding.setWeb3(web3);

var lightwallet = require('eth-lightwallet');

var GuardedProxy = require("../environments/development/contracts/GuardedProxy.sol.js").load(pudding);
GuardedProxy = pudding.whisk({abi: GuardedProxy.abi, binary: GuardedProxy.binary, contract_name: GuardedProxy.contract_name})

var TestRegistry = require("../environments/development/contracts/TestRegistry.sol.js").load(pudding);
TestRegistry = pudding.whisk({abi: TestRegistry.abi, binary: TestRegistry.binary, contract_name: TestRegistry.contract_name})

var proxy;
var testReg;
var logNumber = 1234;

describe("GuardedProxy contract test", function () {
  this.timeout(5000);
  it("Authorizes another owner of a GuardedProxy", function(done) {
    web3.eth.getAccounts(function(err, acct) {
      var newContracts = [GuardedProxy.new({from: acct[0]}),
                          TestRegistry.new({from: acct[0]})];
      Promise.all(newContracts).then(function(cc) {
        proxy = cc[0];
        testReg = cc[1];

        // Set a guard
        return proxy.setGuard(acct[1], {from:acct[0]});
      }).then(function () {
        // Encode the transaction to send to the GuardedProxy contract
        var data = lightwallet.txutils._encodeFunctionTxData('register', ['uint256'], [1000]);
        // Send forward request from guard
        return proxy.forward(testReg.address, 0, '0x' + data, {from:acct[1]});
      }).then(function() {
        // Verify that the GuardedProxy address did not get logged
        return testReg.registry.call(proxy.address);
      }).then(function(regData) {
        expect(regData.toNumber()).to.equal(0);
      }).then(function () {
        // propose a new owner
        return proxy.proposeOwner(acct[2], {from:acct[1]});
      }).then(function () {
        // Encode the transaction to send to the GuardedProxy contract
        var data = lightwallet.txutils._encodeFunctionTxData('register', ['uint256'], [1001]);
        // Send forward request from new owner
        return proxy.forward(testReg.address, 0, '0x' + data, {from:acct[2]});
      }).then(function() {
        // Verify that the GuardedProxy address is still not logged as the owner is still not valid
        return testReg.registry.call(proxy.address);
      }).then(function(regData) {
        expect(regData.toNumber()).to.equal(0);
        done();
      }).catch(done)
    })
  });

});
