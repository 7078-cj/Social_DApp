// src/hooks/useContract.ts
import { ethers } from "ethers";
import Profle from "../ABI/Profile.json"

const CONTRACT_ADDRESS = import.meta.env.VITE_PROFILE_CONTRACT_ADRRESS; 

export default async function useProfileContract() {
   if (!window.ethereum) {
    throw new Error("MetaMask not found. Please install it.");
  }

  // Ask MetaMask for permission
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum); // v6
  const signer = await provider.getSigner(); // must await!
  const contract = new ethers.Contract(CONTRACT_ADDRESS, Profle.abi, signer);

  return contract;
}
