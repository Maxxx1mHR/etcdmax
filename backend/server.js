const path = require("path");
const fs = require("fs");
const http = require("http");
const conf = require("./config");
const etcdApi = require("./etcd_api");
const express = require("express");
const bodyParser = require("body-parser");
const { error } = require("console");

const etcdHost = conf.get("etcdHost") || process.env.ETCD_HOST || "0.0.0.0";
const etcdPort = conf.get("etcdPort") || process.env.ETCD_PORT || 4001;
const serverPort = conf.get("serverPort") || process.env.SERVER_PORT || 8000;
const publicDir = conf.get("publicDir") || "frontend";
const authUser = conf.get("authUser") || process.env.AUTH_USER || "";
const authPass = conf.get("authPass") || process.env.AUTH_PASS || "";

const caFile = conf.get("caFile") || process.env.ETCDCTL_CA_FILE || false;
const keyFile = conf.get("keyFile") || process.env.ETCDCTL_KEY_FILE || false;
const certFile = conf.get("certFile") || process.env.ETCDCTL_CERT_FILE || false;

const MIME_TYPES = {
  html: "text/html",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  js: "text/javascript",
  css: "text/css",
};

const app = express();

let opts = {
  hostname: etcdHost,
  port: etcdPort,
};

// https/certs support
if (certFile) {
  opts.key = fs.readFileSync(keyFile);
  opts.ca = fs.readFileSync(caFile);
  opts.cert = fs.readFileSync(certFile);
}

// view-server authentication
function auth(req, res) {
  if (!authUser) return true;

  let auth = req.headers.authorization;
  if (!auth) return false;

  // malformed
  const parts = auth.split(" ");
  if (parts[0].toLowerCase() !== "basic") return false;
  if (!parts[1]) return false;
  auth = parts[1];

  // credentials
  auth = Buffer(auth, "base64").toString();
  auth = auth.match(/^([^:]*):(.*)$/);
  if (!auth) return false;

  return auth[1] === authUser && auth[2] === authPass;
}

// redirect requests to etcd-server
async function proxy(client_req, client_res) {
  let opts = {
    hostname: etcdHost,
    port: etcdPort,
    path: client_req.url,
    method: client_req.method,
  };

  // https/certs support
  if (certFile) {
    opts.key = fs.readFileSync(keyFile);
    opts.ca = fs.readFileSync(caFile);
    opts.cert = fs.readFileSync(certFile);
  }
}

// requester for communication with etcd-server
let requester = http.request;
if (certFile) {
  // use https requests if theres a cert file
  let https = require("https");
  requester = https.request;

  if (!fs.existsSync(certFile)) {
    console.error("CERT FILE", certFile, "not found!");
    process.exit(1);
  }
  if (!fs.existsSync(keyFile)) {
    console.error("KEY FILE", keyFile, "not found!");
    process.exit(1);
  }
  if (!fs.existsSync(caFile)) {
    console.error("CA FILE", caFile, "not found!");
    process.exit(1);
  }
}

app.use((request, response, next) => {
  if (!auth(request, response)) {
    response.statusCode = 401;
    response.setHeader("WWW-Authenticate", 'Basic realm="MyRealmName"');
    response.end("Unauthorized");
    return;
  }
  next();
});

app.use(
  express.static(publicDir, {
    extensions: Object.keys(MIME_TYPES),
  })
);
app.use(express.static(path.join(__dirname, "frontend", "build")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
});

app.post("/api/v2/etcd/connect", async (request, response) => {
  try {
    const { endpoints, timeoutMs } = request.body || {};
    if (!Array.isArray(endpoints) || endpoints.length === 0) {
      return response
        .status(400)
        .json({ ok: false, error: "endpoints[] is required" });
    }
    await etcdApi.connectEtcd({
      endpoints: request.body.endpoints,
      timeoutMs: request.body.timeoutMs,
    }),
      response.json({ ok: true });
  } catch (e) {
    response.status(400).json({ ok: false, error: e.message });
  }
});

app.get("/api/v2/keys", async (request, response) => {
  try {
    const res = await etcdApi.getAll();
    response.status(200).send(res);
  } catch (e) {
    console.error(e);
    response.status(500).send("Error while processing request");
  }
});

app.put(/api\/v2\/keys\/([a-zA-Z0-9_]+)/, async (request, response) => {
  try {
    const { 0: key } = request.params;
    const res = await etcdApi.put({
      key: key,
      val: JSON.stringify(request.body.value),
    });
    response.status(200).send(res);
  } catch (e) {
    console.error(e);
    response.status(500).send("Error while processing request");
  }
});

app.delete(/api\/v2\/keys\/([a-zA-Z0-9_]+)/, async (request, response) => {
  try {
    console.log("request", request.params);
    const { 0: key } = request.params;
    const res = await etcdApi.del({ key: key });
    response.status(200).send(res);
  } catch (e) {
    console.error(e);
    response.status(500).send("Error while processing request");
  }
});

app.post("/api/v2/etcd/disconnect", async (request, response) => {
  try {
    const res = await etcdApi.disconnect();
    response.status(200).send(res);
  } catch (e) {
    console.error(e);
    response.status(500).send("Error while processing request");
  }
});

app.listen(serverPort, () => {
  console.log(`proxy /api requests to etcd on ${etcdHost}:${etcdPort}`);
  console.log(`etc_viewer listening on port ${serverPort}`);
});
