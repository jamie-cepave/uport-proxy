module.exports = {
  build: {
    "index.html": "index.html",
    "app.js": [
      "javascripts/app.js"
    ],
    "app.css": [
      "stylesheets/app.css"
    ],
    "images/": "images/"
  },
  networks: {
    "live": { network_id: 1 },
    "morden": { network_id: 2 },
    "consensys": { network_id: 161 },
  },
  rpc: {
    host: "localhost",
    port: 8545
  }
};
