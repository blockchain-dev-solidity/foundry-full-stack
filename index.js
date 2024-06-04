import { ethers } from "./ethers-5.6.esm.min.js";
import FundMe from "./out/FundMe.sol/FundMe.json" with { type: "json" };
import RunLatest from "./broadcast/DeployFundMe.s.sol/11155111/run-latest.json" with { type: "json" };
import MyToken from "./out/MyToken.sol/MyToken.json" with { type: "json" };

const fundMeContractAddress = RunLatest.transactions[0].contractAddress;
console.log(`FundMe contract address: ${fundMeContractAddress}`);
const fundMeAbi = FundMe["abi"];

const myTokenContractAddress = RunLatest.transactions[1].contractAddress;
console.log(`MyToken contract address: ${myTokenContractAddress}`);
const myTokenAbi = MyToken["abi"];

const connectButton = document.getElementById("connectButton");
const withdrawButton = document.getElementById("withdrawButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const sendTokenButton = document.getElementById("sendTokenButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
withdrawButton.onclick = withdraw;
balanceButton.onclick = getBalance;
sendTokenButton.onclick = sendToken;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    const accounts = await ethereum.request({ method: "eth_accounts" });
    console.log(accounts);
    connectButton.innerHTML = accounts;
    alert("Connected");
  } else {
    alert("Please install MetaMask");
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding with ${ethAmount}...`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(fundMeContractAddress, fundMeAbi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  } else {
    alert("Please install MetaMask");
  }
}

async function withdraw() {
  console.log(`Withdrawing...`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(fundMeContractAddress, fundMeAbi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      // await transactionResponse.wait(1)
    } catch (error) {
      console.log(error);
    }
  } else {
    alert("Please install MetaMask");
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const balance = await provider.getBalance(fundMeContractAddress);
      console.log(ethers.utils.formatEther(balance));
    } catch (error) {
      console.log(error);
    }
  } else {
    alert("Please install MetaMask");
  }
}

async function sendToken() {
  const tokenAmount = document.getElementById("tokenAmount").value;
  console.log(`Funding with ${tokenAmount} token...`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(myTokenContractAddress, myTokenAbi, signer);
    try {
      const tokenAmountInBaseUnits = ethers.utils.parseUnits(tokenAmount, 18); // converts token amount in base units
      const userAddress = await signer.getAddress();
      const userBalance = await contract.balanceOf(userAddress);
      if(userBalance.lt(tokenAmountInBaseUnits)) { // lt -> less than
        alert("Insufficient token balance");
        return;
      }
      const transactionResponse = await contract.transfer(myTokenContractAddress, tokenAmountInBaseUnits);
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  } else {
    alert("Please install MetaMask");
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations. `
      );
      resolve();
    });
  });
}