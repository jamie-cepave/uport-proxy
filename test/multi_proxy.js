var expect          = require('chai').expect;
var Promise         = require('bluebird');
var Web3            = require('web3');
var web3            = new Web3();
var web3prov        = new web3.providers.HttpProvider('http://localhost:8545');
web3.setProvider(web3prov);

var pudding         = require('ether-pudding');
pudding.setWeb3(web3);

var lightwallet = require('eth-lightwallet');

var MultiProxy = require("../environments/development/contracts/MultiProxy.sol.js").load(pudding);
MultiProxy = pudding.whisk({abi: MultiProxy.abi, binary: MultiProxy.binary, contract_name: MultiProxy.contract_name})

var TestRegistry = require("../environments/development/contracts/TestRegistry.sol.js").load(pudding);
TestRegistry = pudding.whisk({abi: TestRegistry.abi, binary: TestRegistry.binary, contract_name: TestRegistry.contract_name})

var proxy;
var testReg;
var logNumber = 1234;

describe("MultiProxy contract test", function () {
  this.timeout(5000);
  it("Creates and uses a MultiProxy", function(done) {
    web3.eth.getAccounts(function(err, acct) {
      var newContracts = [MultiProxy.new({from: acct[0]}),
                          TestRegistry.new({from: acct[0]}),
                         ];
      Promise.all(newContracts).then(function(cc) {
        proxy = cc[0];
        testReg = cc[1];
        // Encode the transaction to send to the MultiProxy contract
        var data = lightwallet.txutils._encodeFunctionTxData('register', ['uint256'], [logNumber]);
        return proxy.forward(testReg.address, 0, '0x' + data, {from:acct[0]});
      }).then(function() {
        // Verify that the MultiProxy address is logged
        return testReg.registry.call(proxy.address);
      }).then(function(regData) {
        expect(regData.toNumber()).to.equal(logNumber);
        done();
      }).catch(done)
    })
  });

  it("Authorizes another owner of a MultiProxy", function(done) {
    web3.eth.getAccounts(function(err, acct) {
      var newContracts = [MultiProxy.new({from: acct[0]}),
                          TestRegistry.new({from: acct[0]})];
      Promise.all(newContracts).then(function(cc) {
        proxy = cc[0];
        testReg = cc[1];

        // Change owner
        return proxy.authorize(acct[1], {from:acct[0]});
      }).then(function () {
        // Encode the transaction to send to the MultiProxy contract
        var data = lightwallet.txutils._encodeFunctionTxData('register', ['uint256'], [1000]);
        // Send forward request from original owner
        return proxy.forward(testReg.address, 0, '0x' + data, {from:acct[0]});
      }).then(function() {
        // Verify that the MultiProxy address is logged
        return testReg.registry.call(proxy.address);
      }).then(function(regData) {
        expect(regData.toNumber()).to.equal(1000);
      }).then(function () {
        // Encode the transaction to send to the MultiProxy contract
        var data = lightwallet.txutils._encodeFunctionTxData('register', ['uint256'], [1001]);
        // Send forward request from new owner
        return proxy.forward(testReg.address, 0, '0x' + data, {from:acct[1]});
      }).then(function() {
        // Verify that the MultiProxy address is logged
        return testReg.registry.call(proxy.address);
      }).then(function(regData) {
        expect(regData.toNumber()).to.equal(1001);
        done();
      }).catch(done)
    })
  });

  it("Creates a MultiProxy authorizes new owner and revokes original", function(done) {
    web3.eth.getAccounts(function(err, acct) {
      var newContracts = [MultiProxy.new({from: acct[0]}),
                          TestRegistry.new({from: acct[0]})];
      Promise.all(newContracts).then(function(cc) {
        proxy = cc[0];
        testReg = cc[1];

        // Change owner
        return proxy.authorize(acct[1], {from:acct[0]});
      }).then(function () {
        // New owner revokes old owner
        return proxy.revoke(acct[0], {from:acct[1]});
      }).then(function () {
        // Encode the transaction to send to the MultiProxy contract
        var data = lightwallet.txutils._encodeFunctionTxData('register', ['uint256'], [1000]);
        // Send forward request from old owner
        return proxy.forward(testReg.address, 0, '0x' + data, {from:acct[0]});
      }).then(function() {
        // Verify that the MultiProxy address is not logged
        return testReg.registry.call(proxy.address);
      }).then(function(regData) {
        expect(regData.toNumber()).to.equal(0);
        done();
      }).catch(done)
    })
  });

});
