import { useState } from "react";
import server from "./server";
import * as secp256k1 from 'secp256k1';
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import { Buffer } from "buffer"; // Import Buffer

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
      const messageHash = keccak256(utf8ToBytes(`${address}${recipient}${sendAmount}`));
      const messageHashHex = toHex(messageHash); // Convert to hex string
      console.log("messageHashHex ->", messageHashHex);

      // Convert the private key to a Buffer
      const privateKeyBuffer = Buffer.from(privateKey, 'hex');  // Now works in the browser

      // Sign the message hash using the private key
      let signature;
      try {
        // The signature object contains r, s, and recovery
        const { signature: rawSignature, recid } = secp256k1.sign(messageHash, privateKeyBuffer);
        signature = {
          r: rawSignature.slice(0, 32),  // 32 bytes for r
          s: rawSignature.slice(32, 64), // 32 bytes for s
          recoveryParam: recid,           // Recovery parameter (0 or 1)
        };
        console.log("signature ->", signature);
      } catch (err) {
        console.error("Error during signature generation:", err);
        return;
      }

      // Send the signed transaction
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount, 10),
        recipient,
        signature,
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
