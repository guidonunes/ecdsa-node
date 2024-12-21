import server from "./server";





function Wallet({ address, setAddress, balance, setBalance}) {
  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);

    if (address) {
      try{
        const {
          data: { balance },
        } = await server.get(`balance/${address}`);
        setBalance(balance);
      } catch (error){
        alert("Failed to get balance");
        setBalance(0);
      }
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
      Public Address
        <input
          placeholder="Type in your Public Address"
          value={address}
          onChange={onChange}
        ></input>
      </label>

      <div>
        Address: {address ? `${address.slice(0, 10)}...` : "No Address Entered"}
      </div>


      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
