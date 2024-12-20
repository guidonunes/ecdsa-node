const express = require("express");
const cors = require("cors");
const elliptic = require("elliptic");
const crypto = require("crypto");


const app = express();
const port = 3042;
const EC = elliptic.ec;
const ec = new EC("secp256k1");

app.use(cors());
app.use(express.json());
// TODO: make it send a signed transaction to the server
// the server should recover the public key from the signature
const balances = {
  "0x460a9165e91e30ced5ffcf80ff612261621e7a9c": 100,
  //private key: 3a060348fe11bc081a502837710c2a1bd573ee1e323702d56b96255af000abf5
  //public key: 032f18610878e65cac12958294e036990ab0b30f07445301303e09c55beeedb063
  "0x9dc24a4392f548eb870973f444983353ac894f55": 50,
  //private key: f8209888d4acac6ed39d92500003c119c1ace042a43cb9338540d38133b474b7
  //public key: 021b67dd42029cdf7b13d5027ffad16d73adbe31fd537db6c55aa3e6fa54a86ead
  "0x9c0425e2d3bd8e55a5ea12892570292ef74cb20e": 75,
  //private key: eac99640a94e79b4980ccc9fbc8066ba852414458ef0c1baf24b088827bfa203
  //public key: 03784f79e06de321437fca16e6446b21ac1e114ff8172d85b8f9dc0c09af054a6d
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, messageHash } = req.body;

  try {
    // Check if sender and recipient are among the predefined accounts
    if (!balances[sender] || !balances[recipient]) {
      return res.status(400).send({ message: "Invalid sender or recipient address." });
    }

    // Recover public key from the signature
    const keyFromSignature = ec.recoverPubKey(messageHash, signature, signature.recoveryParam);
    const recoveredAddress = keyFromSignature.encode("hex");

    // Check if the key recovered from the signature matches the sender
    if (recoveredAddress !== sender) {
      return res.status(400).send({ message: "Invalid signature" });
    }

    // Check if the message hash is correct
    const expectedHash = crypto.createHash("sha256").update(`${sender}${recipient}${amount}`).digest("hex");
    if (expectedHash !== messageHash) {
      return res.status(400).send({ message: "Invalid message hash" });
    }

    // Ensure the sender has enough balance
    if (balances[sender] < amount) {
      return res.status(400).send({ message: "Not enough funds!" });
    }

    // Perform the transfer
    balances[sender] -= amount;
    balances[recipient] += amount;

    res.send({ balance: balances[sender] });

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
