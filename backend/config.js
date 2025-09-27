const conf = require("nconf");

conf.defaults({
  etcdHost: "127.0.0.1",
  etcdPort: 2379,
  serverPort: 8000,
  publicDir: "frontend",
  authUser: "",
  authPass: "",
  caFile: "",
  keyFile: "",
  certFile: "",
});

module.exports = conf;
