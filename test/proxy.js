var expect          = require('chai').expect;
var Promise         = require('bluebird');
var Web3            = require('web3');
var web3            = new Web3();
var web3prov        = new web3.providers.HttpProvider('http://localhost:8545');
web3.setProvider(web3prov);

var pudding         = require('ether-pudding');
pudding.setWeb3(web3);

var lightwallet = require('eth-lightwallet');

var Proxy = require("../environments/development/contracts/Proxy.sol.js").load(pudding);
Proxy = pudding.whisk({abi: Proxy.abi, binary: Proxy.binary, contract_name: Proxy.contract_name})

var TestRegistry = require("../environments/development/contracts/TestRegistry.sol.js").load(pudding);
TestRegistry = pudding.whisk({abi: TestRegistry.abi, binary: TestRegistry.binary, contract_name: TestRegistry.contract_name})

var OwnerWithAdmin = require("../environments/development/contracts/OwnerWithAdmin.sol.js").load(pudding);
OwnerWithAdmin = pudding.whisk({abi: OwnerWithAdmin.abi, binary: OwnerWithAdmin.binary, contract_name: OwnerWithAdmin.contract_name})


var proxy;
var testReg;
var logNumber = 1234;

describe("Proxy contract test", function () {
  this.timeout(5000);
  it("Creates and uses a proxy", function(done) {
    web3.eth.getAccounts(function(err, acct) {
      var newContracts = [Proxy.new({from: acct[0]}),
                          TestRegistry.new({from: acct[0]}),
                         ];
      Promise.all(newContracts).then(function(cc) {
        proxy = cc[0];
        testReg = cc[1];
        // Encode the transaction to send to the proxy contract
        var data = lightwallet.txutils._encodeFunctionTxData('register', ['uint256'], [logNumber]);
        return proxy.forward(testReg.address, 0, '0x' + data, {from:acct[0]});
      }).then(function() {
        // Verify that the proxy address is logged
        return testReg.registry.call(proxy.address);
      }).then(function(regData) {
        expect(regData.toNumber()).to.equal(logNumber);
        done();
      }).catch(done)
    })
  });

  it("Changes the owner of a proxy", function(done) {
    web3.eth.getAccounts(function(err, acct) {
      var newContracts = [Proxy.new({from: acct[0]}),
                          TestRegistry.new({from: acct[0]})];
      Promise.all(newContracts).then(function(cc) {
        proxy = cc[0];
        testReg = cc[1];

        // Change owner
        return proxy.transfer(acct[1], {from:acct[0]});
      }).then(function () {
        // Encode the transaction to send to the proxy contract
        var data = lightwallet.txutils._encodeFunctionTxData('register', ['uint256'], [logNumber]);
        // Send forward request from new owner
        return proxy.forward(testReg.address, 0, '0x' + data, {from:acct[1]});
      }).then(function() {
        // Verify that the proxy address is logged
        return testReg.registry.call(proxy.address);
      }).then(function(regData) {
        expect(regData.toNumber()).to.equal(logNumber);
        done();
      }).catch(done)
    })
  });


});
