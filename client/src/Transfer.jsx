import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance, privateKey, setPrivateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    if (!privateKey) {
      alert("Please enter a private key");
      return;
    }

    try {
      // Concatenate the inputs and hash them
      const messageHash = keccak256(
        utf8ToBytes(`${address}${recipient}${sendAmount}`)
      );
      console.log("messageHash ->", messageHash);

      // Sign the hash using the private key
      const signature = secp256k1.sign(messageHash, privateKey);
      console.log("signature ->", signature);

      // Directly use the raw signature values
      const { r, s, recovery } = signature;

      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount, 10),
        recipient,
        signature: {
          r,
          s,
          recoveryParam: recovery, // No formatting needed
        },
      });

      setBalance(balance);
    } catch (ex) {
      console.error("Error during transfer:", ex);
      if (ex.response) {
        console.error("Response error:", ex.response);
        alert(ex.response.data.message || "An error occurred");
      } else {
        console.error("Unexpected error:", ex);
        alert("An unexpected error occurred");
      }
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <label>
        Private Key
        <input
          type="password"
          placeholder="Type in a Private Key"
          value={privateKey}
          onChange={(evt) => setPrivateKey(evt.target.value)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
