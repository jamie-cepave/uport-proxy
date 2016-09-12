module.exports = function(deployer) {
  deployer.deploy(Owned);
  deployer.deploy(Proxy);
  deployer.deploy(RecoverableController);
  deployer.deploy(TestRegistry);
  deployer.deploy(RecoveryQuorum);
  deployer.deploy(IdentityFactory);
};
