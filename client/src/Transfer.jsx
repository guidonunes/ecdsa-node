import { useState } from "react";
import server from "./server";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import { secp256k1 } from "ethereum-cryptography/secp256k1"; // Correct way to import secp256k1
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
        // Using secp.sign to sign the messageHash
        const { signature: sig, recovery } = await secp256k1.sign(messageHash, privateKeyBuffer);
        signature = sig;
        console.log("signature ->", signature);
        console.log("recovery ->", recovery);
      } catch (err) {
        console.error("Error during signature generation:", err);
        return;
      }

      // Extract the r, s, and recovery data from the signature
      const r = signature.slice(0, 32);  // 32 bytes for r
      const s = signature.slice(32, 64); // 32 bytes for s
      const recoveryParam = recovery; // Recovery parameter

      console.log("Signature data:", { r, s, recoveryParam });

      // Send the signed transaction
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount, 10),
        recipient,
        signature: {
          r: toHex(r),
          s: toHex(s),
          recoveryParam,
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
        />
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        />
      </label>

      <label>
        Private Key
        <input
          type="password"
          placeholder="Type in a Private Key"
          value={privateKey}
          onChange={(evt) => setPrivateKey(evt.target.value)}
        />
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
