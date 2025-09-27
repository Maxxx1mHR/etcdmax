const { Etcd3 } = require("etcd3");
const fs = require("fs");
const path = require("path");

let client = null;

async function connectEtcd({ endpoints, timeoutMs = 5000 }) {
  console.log("[etcd] connectEtcd called with", endpoints);
  if (!Array.isArray(endpoints) || endpoints.length === 0) {
    throw new Error("endpoints[] is required");
  }
  if (client) {
    try {
      await client.close();
    } catch {}
    client = null;
  }

  client = new Etcd3({
    hosts: endpoints,
    credentials: {
      rootCertificate: fs.readFileSync(
        path.join(__dirname, "cert_example", "etcd-root-ca.pem")
      ),
      certChain: fs.readFileSync(
        path.join(__dirname, "cert_example", "client.pem")
      ),
      privateKey: fs.readFileSync(
        path.join(__dirname, "cert_example", "client-key.pem")
      ),
    },
    defaultCallOptions: () => ({ deadline: Date.now() + timeoutMs }),
  });
}

// const client = new Etcd3({
//   credentials: {
//     rootCertificate: fs.readFileSync(
//       path.join(__dirname, "cert_example", "etcd-root-ca.pem")
//     ),
//     certChain: fs.readFileSync(
//       path.join(__dirname, "cert_example", "client.pem")
//     ),
//     privateKey: fs.readFileSync(
//       path.join(__dirname, "cert_example", "client-key.pem")
//     ),
//   },
// });

async function getAll() {
  if (!client) throw new Error("Not connected to etcd");
  const keys = await client.getAll().strings();
  let nodes = [];
  for (let key in keys) {
    let node = {
      key,
      value: keys[key],
    };
    nodes.push(node);
  }
  return nodes;
}

async function put({ key, val }) {
  if (!client) throw new Error("Not connected to etcd");
  console.log("111111111111111111111111111111111");
  const result = await client.put(key).value(val);
  return result;
}

async function disconnect() {
  if (client) {
    try {
      await client.close();
    } catch (e) {
      console.error("[etcd] error while closing client", e);
    } finally {
      client = null;
    }
  }
}

async function del({ key }) {
  if (!client) throw new Error("Not connected to etcd");
  const result = await client.delete().key(key);
  return result;
}

module.exports = {
  connectEtcd,
  getAll,
  put,
  disconnect,
  del,
};
