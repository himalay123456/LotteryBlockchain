import React, {useState, useEffect} from 'react';
import Loader from 'react-loader-spinner';
import './App.css';

//Web3 Imports
import web3 from './web3';
import lottery, {address} from './lottery';

const App = () => {
  const [managerAddress, setManagerAddress] = useState('');
  const [players, setPlayers] = useState(0);
  const [error, setError] = useState('')
  const [poolPrize, setPoolPrize] = useState(0);
  const [value, setValue] = useState('');
  const [winner, setWinner] = useState('');
  const [loader, setLoader] = useState({
    loading: false,
    success: false,
    winner: false,
    text: ''
  });

  const changeValue = (e) => {
    setValue(e.target.value);
  }

  const submitForm = async(e) => {
    try{
      e.preventDefault();
      setError('');
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      setLoader({
        loading: true,
        text: 'Please Wait for 15-20 seconds. Payment is in progress......'
      })
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(value, 'ether')
      })
      setLoader({
        loading: false,
        success:true,
      })
      setValue('')
    }catch(err)
    {
      setLoader({
        loading: false,
        text: ''
      })
      setValue('')

      if(err.code)
      setError(err.message);

      else
      setError('Please Enter the amount of ether greater than 0.01')
    }
  }

  const pickWinner = async() => {
    try{
      setError('');
      setLoader({
        winner:true,
      });
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      await lottery.methods.pickWinner().send({ from: accounts[0]});
        setLoader({
          winner:false,
        });
    }catch(err)
    {
      console.log(err)
      setLoader({
        winner:false,
      });
      setError('Only the manager of this contract can pick up a winner');
    }
  }

  const getWinnerAddress = async() => {
    const winnerAddress = await lottery.methods.getWinner().call();
    setWinner(winnerAddress);
  }

  const getManager = async() => {
    const manager = await lottery.methods.manager().call();
    setManagerAddress(manager);
    return;
  }

  const getPlayers = async() => {
    const players = await lottery.methods.getAllPlayers().call();
    setPlayers(players.length);
    return;
  }

  const getPoolPrize = async() => {
    const prize = await web3.eth.getBalance(address);
    setPoolPrize(web3.utils.fromWei(prize, 'ether'));
    return;
  }

  useEffect(() => {
    getManager();
    getPlayers();
    getPoolPrize();
    getWinnerAddress();
  }, [loader]);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Lottery <code>Pool</code> is live !.
        </p> 
        <p>This Lottery Pool is managed by {managerAddress} </p>
      </header>
      <p>This Lottery Pool has currently {players} Players. </p>
      <p>This Lottery Pool has currently the prize of  {poolPrize} Ethereum. </p>
      <div className="form">
      <h3> Want to try your luck? Enter the lottery pool Now ! </h3>
      <form onSubmit={submitForm}>
        <label>
          Amount to Pay in Ether ( Minimum Ether to pay : 0.01 )
        </label>
        <br/>
        <input value={value} style={{ padding: '5px', marginTop: '20px' }} type="number" onChange={changeValue} placeholder="Enter the amount"/>
        <button type="submit" style={{ padding: '5px', cursor: 'pointer', }}>Pay Now</button>
      </form>
      {loader.loading && <>
        <Loader
          type="Bars"
          color="orange"
          height={70}
          style={{ marginTop: '30px' }}
          width={200}
        />
          <h4 style={{ marginBottom: '50px' }}>{loader.text}</h4>
        </>
      }
      { loader.success && <h4 style={{ marginBottom: '50px', color: 'green', background: 'white', padding: '5px 15px' }}>Payment Success. </h4> }
      </div>
      { error.length > 0 && <h5 style={{ marginBottom: '50px', color: 'red' }}>{error}</h5> }
      <div style={{ marginBottom: '50px' }}>
        { players > 1 && <>
            <h1 style={{ color: 'black' }}>Pickup a winner !</h1>
            <button style={{ padding: '10px', cursor: 'pointer', background: 'teal', color: 'white', border: 'none', borderRadius: '5px' }} onClick={pickWinner}>
              { loader.winner ? <Loader
                  type="Bars"
                  color="white"
                  height={20}
                  width={80}
              /> : 'Pick Winner'
              }
            </button>
            { loader.winner && <h3>Picking a winner for you. It will take 15-20 seconds. Just Hold on Still.....</h3>}
          </>
        } 
        { winner.length > 0 && <>
            <h4>Hurrah! We have a winner from the last lottery lucky draw.</h4>
            <h3>And the winner from the last lucky draw is : {winner}</h3>
          </>
        }
      </div>
    </div>
  );
}

export default App;
