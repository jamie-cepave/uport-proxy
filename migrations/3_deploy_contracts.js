module.exports = function(deployer) {
  deployer.deploy(Lib);
  deployer.deploy(SharedController);
  deployer.deploy(SharedIdentityFactory);
};
