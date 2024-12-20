import { useState } from "react";
// import server from "./server";
import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { toHex, utf8ToBytes } from 'ethereum-cryptography/utils';
import { keccak256 } from 'ethereum-cryptography/keccak';

function Transfer({ address, setBalance, privateKey, setPrivateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    if(!privateKey) {
      alert("Please enter a private key");
      return;
    }

    try {
      // create the message hash
      const message = JSON.stringify({ sender: address, amount: parseInt(sendAmount), recipient });
      const messageHash = keccak256(utf8ToBytes(message));

     //Sign the hash using the private key
      const signature = secp256k1.sign(messageHash, privateKey);

      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature: {
          r: toHex(signature.r),
          s: toHex(signature.s),
          recoveryParam: signature.recovery,
        },
      });

      setBalance(balance);
    } catch (ex) {
      alert(ex.response?.data?.message || "An error occurred");
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
          type='password'
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
