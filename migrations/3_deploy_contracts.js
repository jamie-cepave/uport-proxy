module.exports = function(deployer) {
  deployer.deploy(Lib);
  deployer.autolink();
  deployer.deploy(SharedControllerFactory);
  deployer.autolink();
};
