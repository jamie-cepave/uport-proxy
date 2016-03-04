"use strict";

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var factory = function factory(Pudding) {
  // Inherit from Pudding. The dependency on Babel sucks, but it's
  // the easiest way to extend a Babel-based class. Note that the
  // resulting .js file does not have a dependency on Babel.

  var MultipleOwned = (function (_Pudding) {
    _inherits(MultipleOwned, _Pudding);

    function MultipleOwned() {
      _classCallCheck(this, MultipleOwned);

      _get(Object.getPrototypeOf(MultipleOwned.prototype), "constructor", this).apply(this, arguments);
    }

    return MultipleOwned;
  })(Pudding);

  ;

  // Set up specific data for this class.
  MultipleOwned.abi = [{ "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "owners", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "addr", "type": "address" }], "name": "isOwner", "outputs": [{ "name": "", "type": "bool" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "_owner", "type": "address" }], "name": "revoke", "outputs": [], "type": "function" }, { "constant": false, "inputs": [{ "name": "_owner", "type": "address" }], "name": "authorize", "outputs": [], "type": "function" }, { "inputs": [], "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "addedBy", "type": "address" }, { "indexed": false, "name": "newOwner", "type": "address" }], "name": "Authorized", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "revokedBy", "type": "address" }, { "indexed": false, "name": "newOwner", "type": "address" }], "name": "Revoked", "type": "event" }];
  MultipleOwned.binary = "6060604052600160a060020a033316600090815260208190526040902042905561017d8061002d6000396000f3606060405260e060020a6000350463022914a7811461003c5780632f54bf6e1461005457806374a8f1031461008a578063b6a5d7de14610099575b005b6100a860043560006020819052908152604090205481565b6100a86004355b600160a060020a03811660009081526020819052604081205481811180156100835750428111155b9392505050565b61003a60043561011c3361005b565b61003a6004356100ba3361005b565b60408051918252519081900360200190f35b1561011957600160a060020a038181166000818152602081815260409182902042905581513394909416845283019190915280517ff5a7f4fb8a92356e8c8c4ae7ac3589908381450500a7e2fd08c95600021ee8899281900390910190a15b50565b1561011957600160a060020a038181166000818152602081815260408083209290925581513394909416845283019190915280517fc336937d058cc0fc95b7491390ffcf122da8cf400512d9714a76f644aa8955b79281900390910190a15056";

  if ("" != "") {
    MultipleOwned.address = "";

    // Backward compatibility; Deprecated.
    MultipleOwned.deployed_address = "";
  }

  MultipleOwned.generated_with = "1.0.3";
  MultipleOwned.contract_name = "MultipleOwned";

  return MultipleOwned;
};

// Nicety for Node.
factory.load = factory;

if (typeof module != "undefined") {
  module.exports = factory;
} else {
  // There will only be one version of Pudding in the browser,
  // and we can use that.
  window.MultipleOwned = factory;
}