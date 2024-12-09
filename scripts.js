import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

/**
 * Constants
 */
// Contract address on the Sepolia network
const CONTRACT_ADDRESS = "0x639D16C51bE7dd92886880061894eCA58C7B0b61";

// Contract ABI (Application Binary Interface)
const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_tokenA", type: "address" },
      { internalType: "address", name: "_tokenB", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "reserveA",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "reserveB",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenA",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenB",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_token", type: "address" }],
    name: "getPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountA", type: "uint256" },
      { internalType: "uint256", name: "amountB", type: "uint256" },
    ],
    name: "addLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountA", type: "uint256" },
      { internalType: "uint256", name: "amountB", type: "uint256" },
    ],
    name: "removeLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amountA", type: "uint256" }],
    name: "swapAforB",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amountB", type: "uint256" }],
    name: "swapBforA",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Global variables
let provider, signer, contract;

// UI Elements
const contractDataSection = document.getElementById("liquidityModule");
const liquidityManagementSection = document.getElementById("dataModule");
const tokenSwapSection = document.getElementById("swapModule");

/**
 * Initialize connection with MetaMask
 */
async function connectMetaMask() {
  if (!window.ethereum) {
    alert("MetaMask not detected. Please install MetaMask to continue.");
    return;
  }

  try {
    // Request connection to MetaMask
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Setup provider, signer, and contract instance
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Fetch and display user data
    const userAddress = await signer.getAddress();
    await updateUserBalances(userAddress);

    // Display contract data
    contractDataSection.classList.remove("hidden");
    liquidityManagementSection.classList.remove("hidden");
    tokenSwapSection.classList.remove("hidden");

    loadContractData();
  } catch (error) {
    console.error(error);
    alert("Failed to connect to MetaMask.");
  }
}

/**
 * Fetch and update user token balances
 * @param {string} userAddress - User's Ethereum address
 */
async function updateUserBalances(userAddress) {
  try {
    const tokenAAddress = await contract.tokenA();
    const tokenBAddress = await contract.tokenB();
    const tokenABalance = await getTokenBalance(tokenAAddress, userAddress);
    const tokenBBalance = await getTokenBalance(tokenBAddress, userAddress);

    const statusElement = document.getElementById("status");
    statusElement.classList.remove("hidden");
    statusElement.innerHTML = `
      Connected to MetaMask: <span class="font-bold">${userAddress}</span>
      <p class="ml-4 text-gray-300">Token A Balance: ${ethers.formatUnits(
        tokenABalance,
        18
      )}</p>
      <p class="ml-4 text-gray-300">Token B Balance: ${ethers.formatUnits(
        tokenBBalance,
        18
      )}</p>
    `;
  } catch (error) {
    console.error("Error updating balances:", error);
  }
}

/**
 * Load and display contract data
 */
async function loadContractData() {
  try {
    const tokenAAddress = await contract.tokenA();
    const tokenBAddress = await contract.tokenB();
    const reserveA = await contract.reserveA();
    const reserveB = await contract.reserveB();
    const priceA = await contract.getPrice(tokenAAddress);
    const priceB = await contract.getPrice(tokenBAddress);
    const owner = await contract.owner();

    const contractDataDiv = document.getElementById("contractData");
    contractDataDiv.innerHTML = `
      <p>Contract Owner: ${owner}</p>
      <p>Token A Address: ${tokenAAddress}</p>
      <p>Token B Address: ${tokenBAddress}</p>
      <p>Reserve A: ${ethers.formatUnits(reserveA, 18)}</p>
      <p>Reserve B: ${ethers.formatUnits(reserveB, 18)}</p>
      <p>Price of Token A (in Token B): ${ethers.formatUnits(priceA, 18)}</p>
      <p>Price of Token B (in Token A): ${ethers.formatUnits(priceB, 18)}</p>
    `;
    connectMetaMask();
  } catch (error) {
    console.error("Failed to load contract data:", error);
    alert("Error fetching contract data.");
  }
}

/**
 * Get ERC20 token balance for a specific user
 * @param {string} tokenAddress - Token contract address
 * @param {string} userAddress - User's Ethereum address
 * @returns {Promise<BigNumber>} Token balance
 */
async function getTokenBalance(tokenAddress, userAddress) {
  try {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ["function balanceOf(address owner) view returns (uint256)"],
      signer
    );
    return await tokenContract.balanceOf(userAddress);
  } catch (error) {
    console.error("Error getting token balance:", error);
    return ethers.BigNumber.from(0); // Return 0 on error
  }
}

/**
 * Handle liquidity actions (add/remove)
 */
async function handleLiquidityAction() {
  const action = document.getElementById("liquidityAction").value;
  const amountA = document.getElementById("amountA").value;
  const amountB = document.getElementById("amountB").value;

  if (!amountA || !amountB) {
    alert("Please enter valid amounts for both tokens.");
    return;
  }

  try {
    const amountAInWei = ethers.parseUnits(amountA, 18);
    const amountBInWei = ethers.parseUnits(amountB, 18);

    if (action === "add") {
      const tx = await contract.addLiquidity(amountAInWei, amountBInWei);
      await tx.wait();
      alert("Liquidity added successfully!");
    } else if (action === "remove") {
      const tx = await contract.removeLiquidity(amountAInWei, amountBInWei);
      await tx.wait();
      alert("Liquidity removed successfully!");
    }
    loadContractData();
  } catch (error) {
    console.error("Liquidity action failed:", error);
    alert(`Failed to ${action === "add" ? "add" : "remove"} liquidity.`);
  }
}

/**
 * Handle token swap actions (A -> B or B -> A)
 */
async function handleSwapAction() {
  const action = document.getElementById("swapAction").value;
  const amountIn = document.getElementById("amountIn").value;

  if (!amountIn) {
    alert("Please enter a valid token amount.");
    return;
  }

  try {
    const amountInWei = ethers.parseUnits(amountIn, 18);

    if (action === "AtoB") {
      const tx = await contract.swapAforB(amountInWei);
      await tx.wait();
      alert("Swap from A to B completed!");
    } else if (action === "BtoA") {
      const tx = await contract.swapBforA(amountInWei);
      await tx.wait();
      alert("Swap from B to A completed!");
    }
    loadContractData();
  } catch (error) {
    console.error("Token swap failed:", error);
    alert(`Failed to swap tokens: ${action}.`);
  }
}

/**
 * Event Listeners
 */
document
  .getElementById("connectMetaMask")
  .addEventListener("click", connectMetaMask);
document
  .getElementById("liquidityActionBtn")
  .addEventListener("click", handleLiquidityAction);
document
  .getElementById("swapActionButton")
  .addEventListener("click", handleSwapAction);
