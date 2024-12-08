import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

// Dirección del contrato en Sepolia
const contractAddress = "0x639D16C51bE7dd92886880061894eCA58C7B0b61";

// ABI del contrato
const contractABI = [
  {
    inputs: [
      { internalType: "address", name: "_tokenA", type: "address" },
      { internalType: "address", name: "_tokenB", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "provider",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountA",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountB",
        type: "uint256",
      },
    ],
    name: "LiquidityAdded",
    type: "event",
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
    inputs: [{ internalType: "uint256", name: "amountAIn", type: "uint256" }],
    name: "swapAforB",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amountBIn", type: "uint256" }],
    name: "swapBforA",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Variables globales
let provider;
let signer;
let contract;

const contractDataSection = document.getElementById("liquidityModule");
const liquidityManagementSection = document.getElementById("dataModule");
const tokenSwapSection = document.getElementById("swapModule");

// Conectar MetaMask
async function connectMetaMask() {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask not detected. Please install MetaMask to continue.");
    return;
  }

  try {
    // Solicitar conexión a MetaMask
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Crear proveedor y firmante
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    // Crear una instancia del contrato
    contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Obtener la dirección del usuario conectado
    const userAddress = await signer.getAddress();

    // Obtener los balances de Token A y Token B
    const tokenAAddress = await contract.tokenA();
    const tokenBAddress = await contract.tokenB();
    const tokenABalance = await getTokenBalance(tokenAAddress);
    const tokenBBalance = await getTokenBalance(tokenBAddress);

    // Actualizar el estado en la UI
    const statusElement = document.getElementById("status");
    statusElement.classList.remove("hidden");
    statusElement.innerHTML = `
      Connected to MetaMask:
      <span class="font-bold">${userAddress}</span>
      <p class="ml-4 text-gray-300">Token A Balance: ${ethers.formatUnits(
        tokenABalance,
        18
      )}</p>
      <p class="ml-4 text-gray-300">Token B Balance: ${ethers.formatUnits(
        tokenBBalance,
        18
      )}</p>
    `;

    contractDataSection.classList.remove("hidden");
    liquidityManagementSection.classList.remove("hidden");
    tokenSwapSection.classList.remove("hidden");

    // Cargar datos del contrato
    loadContractData();
  } catch (error) {
    console.error(error);
    alert("Failed to connect to MetaMask.");
  }
}

// Cargar los datos del contrato
async function loadContractData() {
  try {
    // Obtener las direcciones de los tokens A y B
    const tokenAAddress = await contract.tokenA();
    const tokenBAddress = await contract.tokenB();

    // Obtener reservas del contrato
    const reserveA = await contract.reserveA();
    const reserveB = await contract.reserveB();

    // Obtener precios de los tokens usando la función getPrice
    const priceA = await contract.getPrice(tokenAAddress); // Precio de A en términos de B
    const priceB = await contract.getPrice(tokenBAddress); // Precio de B en términos de A

    // Obtener el propietario del contrato
    const owner = await contract.owner();

    // Mostrar los datos en la interfaz
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
  } catch (error) {
    console.error(error);
    alert("Failed to fetch contract data.");
  }
}

// Obtener el balance de un token ERC20
async function getTokenBalance(tokenAddress) {
  try {
    // Crear contrato ERC20 para obtener el balance
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ["function balanceOf(address owner) view returns (uint256)"],
      signer
    );

    // Obtener el balance del usuario conectado
    const userAddress = await signer.getAddress();
    const balance = await tokenContract.balanceOf(userAddress);

    return balance;
  } catch (error) {
    console.error("Error getting token balance", error);
    return ethers.BigNumber.from(0); // Si hay un error, retornamos 0
  }
}

// Asignar la función de conexión al botón
document
  .getElementById("connectMetaMask")
  .addEventListener("click", connectMetaMask);

async function handleLiquidityAction() {
  const action = document.getElementById("liquidityAction").value; // Get selected action
  const amountA = document.getElementById("amountA").value;
  const amountB = document.getElementById("amountB").value;

  if (!amountA || !amountB) {
    alert("Please enter valid amounts for both tokens.");
    return;
  }

  try {
    const amountAInWei = ethers.parseUnits(amountA, 18);
    const amountBInWei = ethers.parseUnits(amountB, 18);

    const signer = provider.getSigner();

    if (action === "add") {
      // Add Liquidity Logic
      const tx = await contract.addLiquidity(amountAInWei, amountBInWei);
      await tx.wait();
      alert("Liquidity added successfully!");
    } else if (action === "remove") {
      // Remove Liquidity Logic
      const tx = await contract.removeLiquidity(amountAInWei, amountBInWei);
      await tx.wait();
      alert("Liquidity removed successfully!");
    }
    loadContractData();
    connectMetaMask();
  } catch (error) {
    console.error(error);
    alert(`Failed to ${action === "add" ? "add" : "remove"} liquidity.`);
  }
}

// Event listener for the button
document
  .getElementById("liquidityActionBtn")
  .addEventListener("click", handleLiquidityAction);

async function handleSwapAction() {
  const action = document.getElementById("swapAction").value; // Get selected action
  const amountIn = document.getElementById("amountIn").value;

  if (!amountIn) {
    alert("Please enter valid amount for tokens.");
    return;
  }

  try {
    const amountInWei = ethers.parseUnits(amountIn, 18);

    const signer = provider.getSigner();

    if (action === "AtoB") {
      // AtoB Logic
      const tx = await contract.swapAforB(amountInWei);
      await tx.wait();
      alert("Swap to B successfully!");
    } else if (action === "BtoA") {
      // BtoA Logic
      const tx = await contract.swapBforA(amountInWei);
      await tx.wait();
      alert("Swap to A successfully!");
    }
    loadContractData();
    connectMetaMask();
  } catch (error) {
    console.error(error);
    alert(`Failed to swap ${action === "AtoB" ? "AtoB" : "BtoA"} tokens.`);
  }
}

// Event listener for the button
document
  .getElementById("swapActionButton")
  .addEventListener("click", handleSwapAction);
