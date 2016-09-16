var Web3 = require("web3");

(function() {
  // Planned for future features, logging, etc.
  function Provider(provider) {
    this.provider = provider;
  }

  Provider.prototype.send = function() {
    this.provider.send.apply(this.provider, arguments);
  };

  Provider.prototype.sendAsync = function() {
    this.provider.sendAsync.apply(this.provider, arguments);
  };

  var BigNumber = (new Web3()).toBigNumber(0).constructor;

  var Utils = {
    is_object: function(val) {
      return typeof val == "object" && !Array.isArray(val);
    },
    is_big_number: function(val) {
      if (typeof val != "object") return false;

      // Instanceof won't work because we have multiple versions of Web3.
      try {
        new BigNumber(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    merge: function() {
      var merged = {};
      var args = Array.prototype.slice.call(arguments);

      for (var i = 0; i < args.length; i++) {
        var object = args[i];
        var keys = Object.keys(object);
        for (var j = 0; j < keys.length; j++) {
          var key = keys[j];
          var value = object[key];
          merged[key] = value;
        }
      }

      return merged;
    },
    promisifyFunction: function(fn, C) {
      var self = this;
      return function() {
        var instance = this;

        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {
          var callback = function(error, result) {
            if (error != null) {
              reject(error);
            } else {
              accept(result);
            }
          };
          args.push(tx_params, callback);
          fn.apply(instance.contract, args);
        });
      };
    },
    synchronizeFunction: function(fn, C) {
      var self = this;
      return function() {
        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {

          var callback = function(error, tx) {
            if (error != null) {
              reject(error);
              return;
            }

            var timeout = C.synchronization_timeout || 240000;
            var start = new Date().getTime();

            var make_attempt = function() {
              C.web3.eth.getTransactionReceipt(tx, function(err, receipt) {
                if (err) return reject(err);

                if (receipt != null) {
                  return accept(tx, receipt);
                }

                if (timeout > 0 && new Date().getTime() - start > timeout) {
                  return reject(new Error("Transaction " + tx + " wasn't processed in " + (timeout / 1000) + " seconds!"));
                }

                setTimeout(make_attempt, 1000);
              });
            };

            make_attempt();
          };

          args.push(tx_params, callback);
          fn.apply(self, args);
        });
      };
    }
  };

  function instantiate(instance, contract) {
    instance.contract = contract;
    var constructor = instance.constructor;

    // Provision our functions.
    for (var i = 0; i < instance.abi.length; i++) {
      var item = instance.abi[i];
      if (item.type == "function") {
        if (item.constant == true) {
          instance[item.name] = Utils.promisifyFunction(contract[item.name], constructor);
        } else {
          instance[item.name] = Utils.synchronizeFunction(contract[item.name], constructor);
        }

        instance[item.name].call = Utils.promisifyFunction(contract[item.name].call, constructor);
        instance[item.name].sendTransaction = Utils.promisifyFunction(contract[item.name].sendTransaction, constructor);
        instance[item.name].request = contract[item.name].request;
        instance[item.name].estimateGas = Utils.promisifyFunction(contract[item.name].estimateGas, constructor);
      }

      if (item.type == "event") {
        instance[item.name] = contract[item.name];
      }
    }

    instance.allEvents = contract.allEvents;
    instance.address = contract.address;
    instance.transactionHash = contract.transactionHash;
  };

  // Use inheritance to create a clone of this contract,
  // and copy over contract's static functions.
  function mutate(fn) {
    var temp = function Clone() { return fn.apply(this, arguments); };

    Object.keys(fn).forEach(function(key) {
      temp[key] = fn[key];
    });

    temp.prototype = Object.create(fn.prototype);
    bootstrap(temp);
    return temp;
  };

  function bootstrap(fn) {
    fn.web3 = new Web3();
    fn.class_defaults  = fn.prototype.defaults || {};

    // Set the network iniitally to make default data available and re-use code.
    // Then remove the saved network id so the network will be auto-detected on first use.
    fn.setNetwork("default");
    fn.network_id = null;
    return fn;
  };

  // Accepts a contract object created with web3.eth.contract.
  // Optionally, if called without `new`, accepts a network_id and will
  // create a new version of the contract abstraction with that network_id set.
  function Contract() {
    if (this instanceof Contract) {
      instantiate(this, arguments[0]);
    } else {
      var C = mutate(Contract);
      var network_id = arguments.length > 0 ? arguments[0] : "default";
      C.setNetwork(network_id);
      return C;
    }
  };

  Contract.currentProvider = null;

  Contract.setProvider = function(provider) {
    var wrapped = new Provider(provider);
    this.web3.setProvider(wrapped);
    this.currentProvider = provider;
  };

  Contract.new = function() {
    if (this.currentProvider == null) {
      throw new Error("SharedIdentityFactory error: Please call setProvider() first before calling new().");
    }

    var args = Array.prototype.slice.call(arguments);

    if (!this.unlinked_binary) {
      throw new Error("SharedIdentityFactory error: contract binary not set. Can't deploy new instance.");
    }

    var regex = /__[^_]+_+/g;
    var unlinked_libraries = this.binary.match(regex);

    if (unlinked_libraries != null) {
      unlinked_libraries = unlinked_libraries.map(function(name) {
        // Remove underscores
        return name.replace(/_/g, "");
      }).sort().filter(function(name, index, arr) {
        // Remove duplicates
        if (index + 1 >= arr.length) {
          return true;
        }

        return name != arr[index + 1];
      }).join(", ");

      throw new Error("SharedIdentityFactory contains unresolved libraries. You must deploy and link the following libraries before you can deploy a new version of SharedIdentityFactory: " + unlinked_libraries);
    }

    var self = this;

    return new Promise(function(accept, reject) {
      var contract_class = self.web3.eth.contract(self.abi);
      var tx_params = {};
      var last_arg = args[args.length - 1];

      // It's only tx_params if it's an object and not a BigNumber.
      if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
        tx_params = args.pop();
      }

      tx_params = Utils.merge(self.class_defaults, tx_params);

      if (tx_params.data == null) {
        tx_params.data = self.binary;
      }

      // web3 0.9.0 and above calls new twice this callback twice.
      // Why, I have no idea...
      var intermediary = function(err, web3_instance) {
        if (err != null) {
          reject(err);
          return;
        }

        if (err == null && web3_instance != null && web3_instance.address != null) {
          accept(new self(web3_instance));
        }
      };

      args.push(tx_params, intermediary);
      contract_class.new.apply(contract_class, args);
    });
  };

  Contract.at = function(address) {
    if (address == null || typeof address != "string" || address.length != 42) {
      throw new Error("Invalid address passed to SharedIdentityFactory.at(): " + address);
    }

    var contract_class = this.web3.eth.contract(this.abi);
    var contract = contract_class.at(address);

    return new this(contract);
  };

  Contract.deployed = function() {
    if (!this.address) {
      throw new Error("Cannot find deployed address: SharedIdentityFactory not deployed or address not set.");
    }

    return this.at(this.address);
  };

  Contract.defaults = function(class_defaults) {
    if (this.class_defaults == null) {
      this.class_defaults = {};
    }

    if (class_defaults == null) {
      class_defaults = {};
    }

    var self = this;
    Object.keys(class_defaults).forEach(function(key) {
      var value = class_defaults[key];
      self.class_defaults[key] = value;
    });

    return this.class_defaults;
  };

  Contract.extend = function() {
    var args = Array.prototype.slice.call(arguments);

    for (var i = 0; i < arguments.length; i++) {
      var object = arguments[i];
      var keys = Object.keys(object);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var value = object[key];
        this.prototype[key] = value;
      }
    }
  };

  Contract.all_networks = {
  "default": {
    "abi": [
      {
        "constant": false,
        "inputs": [
          {
            "name": "userKeys",
            "type": "address[]"
          }
        ],
        "name": "CreateProxyWithSharedController",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "name": "senderToProxy",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "creator",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "proxy",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "controller",
            "type": "address"
          }
        ],
        "name": "IdentityCreated",
        "type": "event"
      }
    ],
    "unlinked_binary": "0x6060604052610d21806100126000396000f3606060405260e060020a60003504636f80e4a28114610026578063e90bcb32146101b4575b005b60048035808201356020810260808181016040526060838152610024959460249491939085019282918490808284375094965050505050505060006000604051610273806101df833901809050604051809103906000f0915081836040516108cf806104528339018083600160a060020a03168152602001806020018281038252838181518152602001915080519060200190602002808383829060006004602084601f0104600302600f01f1509050019350505050604051809103906000f0905081600160a060020a0316631a695230826040518260e060020a0281526004018082600160a060020a031681526020019150506000604051808303816000876161da5a03f11561000257505060408051918252600160a060020a038381166020840152815133909116927f8f2e597fd6e795e9851eea530f987cceb641315e3c7c9d484b798e3159d4209592908290030190a233600160a060020a03166000908152602081905260409020805473ffffffffffffffffffffffffffffffffffffffff191683179055505050565b6101d5600435600060208190529081526040902054600160a060020a031681565b6060908152602090f3606060405260008054600160a060020a0319163317905561024f806100246000396000f3606060405260e060020a60003504631a695230811461003c5780632f54bf6e1461004b5780638da5cb5b14610066578063d7f31eb914610078575b005b61003a6004356100fe33610052565b6100cd6004355b600054600160a060020a0391821691161490565b6100e1600054600160a060020a031681565b604080516020600460443581810135601f810184900484028501840190955284845261003a94823594602480359560649492939190920191819084018382808284375094965050505050505061012633610052565b604080519115158252519081900360200190f35b60408051600160a060020a03929092168252519081900360200190f35b15610123576000805473ffffffffffffffffffffffffffffffffffffffff1916821790555b50565b1561024a5782600160a060020a03168282604051808280519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156101845780820380516001836020036101000a031916815260200191505b5091505060006040518083038185876185025a03f19250505015156101a857610002565b82600160a060020a03167fc1de93dfa06362c6a616cde73ec17d116c0d588dd1df70f27f91b500de207c41838360405180838152602001806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f16801561023b5780820380516001836020036101000a031916815260200191505b50935050505060405180910390a25b5050505660606040526040516108cf3803806108cf83398101604052805160805190910160008054600160a060020a031916831781556001805483518083559282905290917fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf69182019160208501821560b1579160200282015b8281111560b15782518254600160a060020a03191617825560209290920191600191909101906075565b505050506107f7806100d86000396000f35b50609f9291505b8082111560d4578054600160a060020a031916815560010160b8565b509056606060405236156100825760e060020a60003504633cebb8238114610084578063421b2d8b1461011057806345210e9e146101f3578063502c9bd514610361578063518c04ef146103a757806391576f24146103cf578063943e170d1461043f5780639857518814610450578063a591efde1461054a578063ec556889146105b7575b005b61008260043560005433600160a060020a03908116911614156106565760408051600080547f1a695230000000000000000000000000000000000000000000000000000000008352600160a060020a0385811660048501529351931692631a695230926024808201939291829003018183876161da5a03f1156100025750505080600160a060020a0316ff5b61008260043560005433600160a060020a039081169116141561065657604080517ff14717c7000000000000000000000000000000000000000000000000000000008152600160a060020a038316600482015260016024820152905173__Lib___________________________________9163f14717c791604480830192602092919082900301818660325a03f4156100025750506040515160001914159050610656576001805480820180835582818380158290116106595781836000526020600020918201910161065991905b8082111561068857600081556001016101df565b604080516020604435600481810135601f8101849004840285018401909552848452610082948135946024803595939460649492939101918190840183828082843750949650505050505050600073__Lib___________________________________63f14717c73360016000506040518360e060020a0281526004018083600160a060020a03168152602001828152602001925050506020604051808303818660325a03f415610002575050604051516000191490506107e7578383836040518084600160a060020a03166c010000000000000000000000000281526014018381526020018280519060200190808383829060006004602084601f0104600302600f01f15090500193505050506040518091039020905060016002600050600083600019168152602001908152602001600020600050600033600160a060020a0316815260200190815260200160002060006101000a81548160ff0219169083021790555061068c610443565b6105c960043560018054829081101561000257506000527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf60154600160a060020a031681565b6002602090815260043560009081526040808220909252602435815220546105e69060ff1681565b6105fa6004355b6000805b6001548110156107ed576000838152600260205260408120600180549192918490811015610002576000918252602080832090910154600160a060020a0316835282019290925260400190205460ff161561043757600191909101905b6001016103da565b6105fa5b6001805460029004015b90565b61008260043560008054819033600160a060020a039081169116141561054557600160016000508054905003915073__Lib___________________________________63f14717c78460016000506040518360e060020a0281526004018083600160a060020a03168152602001828152602001925050506020604051808303818660325a03f4156100025750506040515191505060001981146105455773__Lib___________________________________63c6f315218260016000506040518360e060020a02815260040180838152602001828152602001925050506000604051808303818660325a03f415610002575050505b505050565b6040805160208181018352600082526001805484518184028101840190955280855261060c94928301828280156105ab57602002820191906000526020600020905b8154600160a060020a031681526001919091019060200180831161058c575b5050505050905061044d565b6105c9600054600160a060020a031681565b60408051600160a060020a03929092168252519081900360200190f35b604080519115158252519081900360200190f35b60408051918252519081900360200190f35b60405180806020018281038252838181518152602001915080519060200190602002808383829060006004602084601f0104600302600f01f1509050019250505060405180910390f35b50565b505050600092835250602090912001805473ffffffffffffffffffffffffffffffffffffffff19169091179055565b5090565b610695826103d6565b106107e7576107138160005b6001548110156107f357600082815260026020526040812060018054839190859081101561000257507fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6850154600160a060020a03169091526020919091526040909120805460ff19169055016106a1565b6107e7848484600060009054906101000a9004600160a060020a0316600160a060020a031663d7f31eb98484846040518460e060020a0281526004018084600160a060020a03168152602001838152602001806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156107c15780820380516001836020036101000a031916815260200191505b509450505050506000604051808303816000876161da5a03f11561000257505050505050565b50505050565b50919050565b505056",
    "updated_at": 1473362461552
  }
};

  Contract.checkNetwork = function(callback) {
    var self = this;

    if (this.network_id != null) {
      return callback();
    }

    this.web3.version.network(function(err, result) {
      if (err) return callback(err);

      var network_id = result.toString();

      // If we have the main network,
      if (network_id == "1") {
        var possible_ids = ["1", "live", "default"];

        for (var i = 0; i < possible_ids.length; i++) {
          var id = possible_ids[i];
          if (Contract.all_networks[id] != null) {
            network_id = id;
            break;
          }
        }
      }

      if (self.all_networks[network_id] == null) {
        return callback(new Error(self.name + " error: Can't find artifacts for network id '" + network_id + "'"));
      }

      self.setNetwork(network_id);
      callback();
    })
  };

  Contract.setNetwork = function(network_id) {
    var network = this.all_networks[network_id] || {};

    this.abi             = this.prototype.abi             = network.abi;
    this.unlinked_binary = this.prototype.unlinked_binary = network.unlinked_binary;
    this.address         = this.prototype.address         = network.address;
    this.updated_at      = this.prototype.updated_at      = network.updated_at;
    this.links           = this.prototype.links           = network.links || {};

    this.network_id = network_id;
  };

  Contract.networks = function() {
    return Object.keys(this.all_networks);
  };

  Contract.link = function(name, address) {
    if (typeof name == "object") {
      Object.keys(name).forEach(function(n) {
        var a = name[n];
        Contract.link(n, a);
      });
      return;
    }

    Contract.links[name] = address;
  };

  Contract.contract_name   = Contract.prototype.contract_name   = "SharedIdentityFactory";
  Contract.generated_with  = Contract.prototype.generated_with  = "3.1.2";

  var properties = {
    binary: function() {
      var binary = Contract.unlinked_binary;

      Object.keys(Contract.links).forEach(function(library_name) {
        var library_address = Contract.links[library_name];
        var regex = new RegExp("__" + library_name + "_*", "g");

        binary = binary.replace(regex, library_address.replace("0x", ""));
      });

      return binary;
    }
  };

  Object.keys(properties).forEach(function(key) {
    var getter = properties[key];

    var definition = {};
    definition.enumerable = true;
    definition.configurable = false;
    definition.get = getter;

    Object.defineProperty(Contract, key, definition);
    Object.defineProperty(Contract.prototype, key, definition);
  });

  bootstrap(Contract);

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of this contract in the browser,
    // and we can use that.
    window.SharedIdentityFactory = Contract;
  }
})();
