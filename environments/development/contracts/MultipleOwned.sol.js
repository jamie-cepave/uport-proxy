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
  MultipleOwned.abi = [{ "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "owners", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "addr", "type": "address" }], "name": "isOwner", "outputs": [{ "name": "", "type": "bool" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "_owner", "type": "address" }], "name": "revoke", "outputs": [], "type": "function" }, { "constant": false, "inputs": [{ "name": "_owner", "type": "address" }], "name": "authorize", "outputs": [], "type": "function" }, { "inputs": [], "type": "constructor" }];
  MultipleOwned.binary = "6060604052600160a060020a033316600090815260208190526040902042905560ee8061002c6000396000f3606060405260e060020a6000350463022914a7811460385780632f54bf6e14604f57806374a8f103146083578063b6a5d7de14608f575b005b609b60043560006020819052908152604090205481565b609b6004355b600160a060020a0381166000908152602081905260408120548181118015607c5750428111155b9392505050565b603660043560d0336055565b603660043560ad336055565b60408051918252519081900360200190f35b1560cd57600160a060020a03811660009081526020819052604090204290555b50565b1560cd57600160a060020a031660009081526020819052604081205556";

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