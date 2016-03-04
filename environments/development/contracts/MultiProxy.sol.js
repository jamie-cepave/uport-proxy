"use strict";

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var factory = function factory(Pudding) {
  // Inherit from Pudding. The dependency on Babel sucks, but it's
  // the easiest way to extend a Babel-based class. Note that the
  // resulting .js file does not have a dependency on Babel.

  var MultiProxy = (function (_Pudding) {
    _inherits(MultiProxy, _Pudding);

    function MultiProxy() {
      _classCallCheck(this, MultiProxy);

      _get(Object.getPrototypeOf(MultiProxy.prototype), "constructor", this).apply(this, arguments);
    }

    return MultiProxy;
  })(Pudding);

  ;

  // Set up specific data for this class.
  MultiProxy.abi = [{ "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "owners", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "addr", "type": "address" }], "name": "isOwner", "outputs": [{ "name": "", "type": "bool" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "_owner", "type": "address" }], "name": "revoke", "outputs": [], "type": "function" }, { "constant": false, "inputs": [{ "name": "_owner", "type": "address" }], "name": "authorize", "outputs": [], "type": "function" }, { "constant": false, "inputs": [{ "name": "destination", "type": "address" }, { "name": "value", "type": "uint256" }, { "name": "data", "type": "bytes" }], "name": "forward", "outputs": [], "type": "function" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "addedBy", "type": "address" }, { "indexed": false, "name": "newOwner", "type": "address" }], "name": "Authorized", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "revokedBy", "type": "address" }, { "indexed": false, "name": "newOwner", "type": "address" }], "name": "Revoked", "type": "event" }];
  MultiProxy.binary = "6060604052600160a060020a03331660009081526020819052604090204290556102648061002d6000396000f3606060405260e060020a6000350463022914a781146100475780632f54bf6e1461005f57806374a8f10314610095578063b6a5d7de146100a4578063d7f31eb9146100b3575b005b61010860043560006020819052908152604090205481565b6101086004355b600160a060020a038116600090815260208190526040812054818111801561008e5750428111155b9392505050565b61004560043561017c33610066565b61004560043561011a33610066565b604080516020600460443581810135601f81018490048402850184019095528484526100459482359460248035956064949293919092019181908401838280828437509496505050505050506101dd33610066565b60408051918252519081900360200190f35b1561017957600160a060020a038181166000818152602081815260409182902042905581513394909416845283019190915280517ff5a7f4fb8a92356e8c8c4ae7ac3589908381450500a7e2fd08c95600021ee8899281900390910190a15b50565b1561017957600160a060020a038181166000818152602081815260408083209290925581513394909416845283019190915280517fc336937d058cc0fc95b7491390ffcf122da8cf400512d9714a76f644aa8955b79281900390910190a150565b1561025f5782600160a060020a03168282604051808280519060200190808383829060006004602084601f0104600302600f01f150905090810190601f16801561023b5780820380516001836020036101000a031916815260200191505b5091505060006040518083038185876185025a03f192505050151561025f57610002565b50505056";

  if ("" != "") {
    MultiProxy.address = "";

    // Backward compatibility; Deprecated.
    MultiProxy.deployed_address = "";
  }

  MultiProxy.generated_with = "1.0.3";
  MultiProxy.contract_name = "MultiProxy";

  return MultiProxy;
};

// Nicety for Node.
factory.load = factory;

if (typeof module != "undefined") {
  module.exports = factory;
} else {
  // There will only be one version of Pudding in the browser,
  // and we can use that.
  window.MultiProxy = factory;
}