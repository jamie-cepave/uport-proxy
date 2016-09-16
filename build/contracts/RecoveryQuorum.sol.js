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
      throw new Error("RecoveryQuorum error: Please call setProvider() first before calling new().");
    }

    var args = Array.prototype.slice.call(arguments);

    if (!this.unlinked_binary) {
      throw new Error("RecoveryQuorum error: contract binary not set. Can't deploy new instance.");
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

      throw new Error("RecoveryQuorum contains unresolved libraries. You must deploy and link the following libraries before you can deploy a new version of RecoveryQuorum: " + unlinked_libraries);
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
      throw new Error("Invalid address passed to RecoveryQuorum.at(): " + address);
    }

    var contract_class = this.web3.eth.contract(this.abi);
    var contract = contract_class.at(address);

    return new this(contract);
  };

  Contract.deployed = function() {
    if (!this.address) {
      throw new Error("Cannot find deployed address: RecoveryQuorum not deployed or address not set.");
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
            "name": "_proposedUserKey",
            "type": "address"
          }
        ],
        "name": "collectedSignatures",
        "outputs": [
          {
            "name": "signatures",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "proposedUserKey",
            "type": "address"
          }
        ],
        "name": "signUserChange",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "newUserKey",
            "type": "address"
          }
        ],
        "name": "changeUserKey",
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
        "name": "delegates",
        "outputs": [
          {
            "name": "deletedAfter",
            "type": "uint256"
          },
          {
            "name": "pendingUntil",
            "type": "uint256"
          },
          {
            "name": "proposedUserKey",
            "type": "address"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "delegateAddresses",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "neededSignatures",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "getAddresses",
        "outputs": [
          {
            "name": "",
            "type": "address[]"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "delegatesToRemove",
            "type": "address[]"
          },
          {
            "name": "delegatesToAdd",
            "type": "address[]"
          }
        ],
        "name": "replaceDelegates",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "controller",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "_controller",
            "type": "address"
          },
          {
            "name": "_delegates",
            "type": "address[]"
          }
        ],
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "action",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "initiatedBy",
            "type": "address"
          }
        ],
        "name": "RecoveryEvent",
        "type": "event"
      }
    ],
    "unlinked_binary": "0x6060604052604051610c91380380610c9183398101604052805160805190910160008054600160a060020a031916831781555b815181101561007857600180548082018083558281838015829011610089576000838152602090206100899181019083015b8082111561015a5760008155600101610064565b505050610b338061015e6000396000f35b5050509190906000526020600020900160008484815181101561000257602081810283018101518554600160a060020a0319161790945560408051606081018252651cae8c13e0008152948501849052840183905281519394506002938110156100025790602001906020020151600160a060020a03168152602001908152602001600020600050600082015181600001600050556020820151816001016000505560408201518160020160006101000a815481600160a060020a0302191690830217905550905050600101610032565b509056606060405236156100775760e060020a600035046323d44dee8114610079578063245d13141461011c5780633f31281a14610176578063587cde1e1461018757806364bc82c3146101b8578063943e170d146101fe578063a39fac121461027f578063e71e592b146102ed578063f77c4791146104c4575b005b6104d66004355b6000805b6001548110156105765761057c600260005060006001600050848154811015610002576000918252602080832090910154600160a060020a039081168452838201949094526040805193810183206060850182528054855260018101549285019290925260029190910154909316928201929092529061093a825b600042826000015111801561095457505060208101514211610171565b61007760043533600160a060020a03908116600090815260026020818152604080519381902060608501825280548552600181015492850192909252910154909216918101919091526105fc905b8051600014155b919050565b6100776004355b60006106a8610202565b6104e860043560026020819052600091825260409091209081015481546001929092015490600160a060020a031683565b61050f60043560018054829081101561000257506000527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf60154600160a060020a031681565b6104d65b600080805b60015481101561081f5761082c600260005060006001600050848154811015610002576000918252602080832090910154600160a060020a03908116845283820194909452604080519381019092206060840183528054845260018101549184019190915260020154909216918101919091526100ff565b61052c6040805160208181018352600082528251600180548084028301840190955284825292939092918301828280156102e357602002820191906000526020600020905b8154600160a060020a03168152600191909101906020018083116102c4575b5050505050905090565b604080516004803580820135602081810285810182019096528185526100779593946024949093850192918291908501908490808284375050604080518735808a013560208181028481018201909552818452989a9960449993985091909101955093508392508501908490808284375094965050505050505060008054604080517f1c1c228900000000000000000000000000000000000000000000000000000000815290518392600160a060020a031691631c1c2289916004828101926020929190829003018187876161da5a03f1156100025750506040515133600160a060020a039081169116141590506108b057600091505b83518210156108b65761092684838151811015610002579060200190602002015142600060009054906101000a9004600160a060020a0316600160a060020a0316631ec9f7b56040518160e060020a0281526004018090506020604051808303816000876161da5a03f1156100025750506040805151600160a060020a03851660009081526002602052919091205492019091111590506106a557600160a060020a0381166000908152600260205260409020600101544290111561095b5760406000908120600160a060020a03831690915260026020524290556106a5565b61050f600054600160a060020a031681565b60408051918252519081900360200190f35b604080519384526020840192909252600160a060020a031682820152519081900360600190f35b60408051600160a060020a03929092168252519081900360200190f35b60405180806020018281038252838181518152602001915080519060200190602002808383829060006004602084601f0104600302600f01f1509050019250505060405180910390f35b50919050565b80156105e7575082600160a060020a03166002600050600060016000508481548110156100025750507fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6840154600160a060020a039081168252602083905260409091209091015416145b156105f457600191909101905b600101610084565b156106a55733600160a060020a03166000908152600260208190526040909120018054600160a060020a031916821790556106368161017d565b6040805133600160a060020a03166020820152818152600e818301527f7369676e557365724368616e6765000000000000000000000000000000000000606082015290517fea8e84a162c4602ea0c61acf85fa1242db8ce550e7a448d613e3c7dff2f067939181900360800190a15b50565b6106b183610080565b1061081b5760408051600080547fc998e9dd000000000000000000000000000000000000000000000000000000008352600160a060020a038681166004850152935193169263c998e9dd926024818101939291829003018183876161da5a03f11561000257505050600090505b60015481101561081b5742600260005060006001600050848154811015610002576000918252602080832090910154600160a060020a0316835282019290925260400190206001015411156107b75742600260005060006001600050848154811015610002579060005260206000209001600090546101009190910a9004600160a060020a031681526020810191909152604001600020555b60018054600291600091849081101561000257507fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6840154600160a060020a03168252602083905260409091209091018054600160a060020a03191690550161071e565b5050565b5060029004600101919050565b1561083957600191909101905b600101610207565b6040805133600160a060020a031660208201528181526010818301527f7265706c61636544656c65676174657300000000000000000000000000000000606082015290517fea8e84a162c4602ea0c61acf85fa1242db8ce550e7a448d613e3c7dff2f067939181900360800190a15b50505050565b5060005b825181101561084157610932838281518110156100025790602001906020020151600160a060020a03818116600090815260026020818152604080519381902060608501825280548552600181015492850192909252910154909216918101919091526109d19061016a565b600191909101906103e4565b6001016108ba565b801561095457508160400151600160a060020a0316600014155b9050610171565b42600060009054906101000a9004600160a060020a0316600160a060020a0316631ec9f7b56040518160e060020a0281526004018090506020604051808303816000876161da5a03f1156100025750506040805151600160a060020a038516600090815260026020529190912092019091555050565b1580156109e15750600154600f90105b156106a557606060405190810160405280651cae8c13e0008152602001600060009054906101000a9004600160a060020a0316600160a060020a0316631ec9f7b56040518160e060020a0281526004018090506020604051808303816000876161da5a03f11561000257505050604051805190602001504201815260200160008152602001506002600050600083600160a060020a03168152602001908152602001600020600050600082015181600001600050556020820151816001016000505560408201518160020160006101000a815481600160a060020a030219169083021790555090505060016000508054806001018281815481835581811511610b0d57818360005260206000209182019101610b0d91905b80821115610b2f5760008155600101610af9565b5050506000928352506020909120018054600160a060020a0319169091179055565b509056",
    "updated_at": 1473362461545
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

  Contract.contract_name   = Contract.prototype.contract_name   = "RecoveryQuorum";
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
    window.RecoveryQuorum = Contract;
  }
})();
