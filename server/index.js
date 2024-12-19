const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());
// TODO: make it send a signed transaction to the server
// the server should recover the public key from the signature
const balances = {
  "03a8be986e721caad992b94545d9c660e47553ef2099d4d37518292bd21f350397": 100,
  "037b6ae538ece6bdc264fd6010a838d88adcabb696fc4bde77a5b2966333a87f5b": 50,
  "0347942a0c37c25bc72bf5566cd70f711a78d618818f0ee18112d5fd4f67a35edd": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
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
