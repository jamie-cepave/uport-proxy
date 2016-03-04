"use strict";

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var factory = function factory(Pudding) {
  // Inherit from Pudding. The dependency on Babel sucks, but it's
  // the easiest way to extend a Babel-based class. Note that the
  // resulting .js file does not have a dependency on Babel.

  var GuardedProxy = (function (_Pudding) {
    _inherits(GuardedProxy, _Pudding);

    function GuardedProxy() {
      _classCallCheck(this, GuardedProxy);

      _get(Object.getPrototypeOf(GuardedProxy.prototype), "constructor", this).apply(this, arguments);
    }

    return GuardedProxy;
  })(Pudding);

  ;

  // Set up specific data for this class.
  GuardedProxy.abi = [{ "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "owners", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "addr", "type": "address" }], "name": "isOwner", "outputs": [{ "name": "", "type": "bool" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "_owner", "type": "address" }], "name": "revoke", "outputs": [], "type": "function" }, { "constant": true, "inputs": [], "name": "guard", "outputs": [{ "name": "", "type": "address" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "owner", "type": "address" }], "name": "proposeOwner", "outputs": [], "type": "function" }, { "constant": false, "inputs": [{ "name": "_owner", "type": "address" }], "name": "authorize", "outputs": [], "type": "function" }, { "constant": false, "inputs": [{ "name": "destination", "type": "address" }, { "name": "value", "type": "uint256" }, { "name": "data", "type": "bytes" }], "name": "forward", "outputs": [], "type": "function" }, { "constant": false, "inputs": [{ "name": "_guard", "type": "address" }], "name": "setGuard", "outputs": [], "type": "function" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "addedBy", "type": "address" }, { "indexed": false, "name": "newOwner", "type": "address" }], "name": "Authorized", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "revokedBy", "type": "address" }, { "indexed": false, "name": "newOwner", "type": "address" }], "name": "Revoked", "type": "event" }];
  GuardedProxy.binary = "6060604052600160a060020a03331660009081526020819052604090204290556103708061002d6000396000f36060604052361561006c5760e060020a6000350463022914a7811461006e5780632f54bf6e1461008657806374a8f103146100bc5780637ceab3b1146100cb578063b5ed298a146100dd578063b6a5d7de1461015d578063d7f31eb91461016c578063e19a9dd9146101c1575b005b6101d060043560006020819052908152604090205481565b6101d06004355b600160a060020a03811660009081526020819052604081205481811180156100b55750428111155b9392505050565b61006c6004356102613361008d565b6101e2600154600160a060020a031681565b61006c600435600154600160a060020a039081163391909116141561025e57600160a060020a0381811660008181526020818152604091829020620151804201905581513394909416845283019190915280517ff5a7f4fb8a92356e8c8c4ae7ac3589908381450500a7e2fd08c95600021ee8899281900390910190a150565b61006c6004356101ff3361008d565b604080516020604435600481810135601f810184900484028501840190955284845261006c9481359460248035959394606494929391019181908401838280828437509496505050505050506102e93361008d565b61006c6004356102c23361008d565b60408051918252519081900360200190f35b60408051600160a060020a03929092168252519081900360200190f35b1561025e57600160a060020a038181166000818152602081815260409182902042905581513394909416845283019190915280517ff5a7f4fb8a92356e8c8c4ae7ac3589908381450500a7e2fd08c95600021ee8899281900390910190a15b50565b1561025e57600160a060020a038181166000818152602081815260408083209290925581513394909416845283019190915280517fc336937d058cc0fc95b7491390ffcf122da8cf400512d9714a76f644aa8955b79281900390910190a150565b1561025e576001805473ffffffffffffffffffffffffffffffffffffffff19168217905550565b1561036b5782600160a060020a03168282604051808280519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156103475780820380516001836020036101000a031916815260200191505b5091505060006040518083038185876185025a03f192505050151561036b57610002565b50505056";

  if ("" != "") {
    GuardedProxy.address = "";

    // Backward compatibility; Deprecated.
    GuardedProxy.deployed_address = "";
  }

  GuardedProxy.generated_with = "1.0.3";
  GuardedProxy.contract_name = "GuardedProxy";

  return GuardedProxy;
};

// Nicety for Node.
factory.load = factory;

if (typeof module != "undefined") {
  module.exports = factory;
} else {
  // There will only be one version of Pudding in the browser,
  // and we can use that.
  window.GuardedProxy = factory;
}