"use strict";

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var factory = function factory(Pudding) {
  // Inherit from Pudding. The dependency on Babel sucks, but it's
  // the easiest way to extend a Babel-based class. Note that the
  // resulting .js file does not have a dependency on Babel.

  var OwnerWithAdmin = (function (_Pudding) {
    _inherits(OwnerWithAdmin, _Pudding);

    function OwnerWithAdmin() {
      _classCallCheck(this, OwnerWithAdmin);

      _get(Object.getPrototypeOf(OwnerWithAdmin.prototype), "constructor", this).apply(this, arguments);
    }

    return OwnerWithAdmin;
  })(Pudding);

  ;

  // Set up specific data for this class.
  OwnerWithAdmin.abi = [{ "constant": true, "inputs": [], "name": "userKey", "outputs": [{ "name": "", "type": "address" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "newUserKey", "type": "address" }], "name": "updateUserKey", "outputs": [], "type": "function" }, { "constant": true, "inputs": [], "name": "adminKey", "outputs": [{ "name": "", "type": "address" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "destination", "type": "address" }, { "name": "value", "type": "uint256" }, { "name": "data", "type": "bytes" }], "name": "sendTx", "outputs": [], "type": "function" }, { "constant": true, "inputs": [], "name": "proxy", "outputs": [{ "name": "", "type": "address" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "newAdminKey", "type": "address" }], "name": "updateAdminKey", "outputs": [], "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "type": "function" }, { "inputs": [{ "name": "proxyAddress", "type": "address" }, { "name": "_userKey", "type": "address" }, { "name": "_adminKey", "type": "address" }], "type": "constructor" }];
  OwnerWithAdmin.binary = "606060405260405160608061033983395060c06040525160805160a05160008054600160a060020a031990811685179091556001805482168417905560028054909116821790555050506102e2806100576000396000f3606060405236156100615760e060020a60003504631c1c228981146100635780632281dad614610075578063233044d0146100b75780636a00016e146100c9578063ec556889146101f8578063ec57ef821461020a578063f2fde38b1461024b575b005b6102cf600154600160a060020a031681565b610061600435600254600160a060020a039081169033168114156100b3576001805473ffffffffffffffffffffffffffffffffffffffff1916831790555b5050565b6102cf600254600160a060020a031681565b60806020604435600481810135601f8101849004909302840160405260608381526100619482359460248035956064949391019190819083828082843750949650505050505050600154600160a060020a039081169033168114156101f257600060009054906101000a9004600160a060020a0316600160a060020a031663d7f31eb98585856040518460e060020a0281526004018084600160a060020a03168152602001838152602001806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156101d05780820380516001836020036101000a031916815260200191505b509450505050506000604051808303816000876161da5a03f115610002575050505b50505050565b6102cf600054600160a060020a031681565b610061600435600254600160a060020a039081169033168114156100b3576002805473ffffffffffffffffffffffffffffffffffffffff1916831790555050565b610061600435600254600160a060020a039081169033168114156100b357600080547f1a695230000000000000000000000000000000000000000000000000000000006060908152600160a060020a038086166064529190911691631a695230916084919060248183876161da5a03f1156100025750505081600160a060020a0316ff5b600160a060020a03166060908152602090f3";

  if ("" != "") {
    OwnerWithAdmin.address = "";

    // Backward compatibility; Deprecated.
    OwnerWithAdmin.deployed_address = "";
  }

  OwnerWithAdmin.generated_with = "1.0.3";
  OwnerWithAdmin.contract_name = "OwnerWithAdmin";

  return OwnerWithAdmin;
};

// Nicety for Node.
factory.load = factory;

if (typeof module != "undefined") {
  module.exports = factory;
} else {
  // There will only be one version of Pudding in the browser,
  // and we can use that.
  window.OwnerWithAdmin = factory;
}