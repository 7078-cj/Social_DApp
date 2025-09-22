// src/hooks/useContract.ts
import { ethers } from "ethers";
import Posts from "../ABI/Posts.json"

const CONTRACT_ADDRESS = import.meta.env.VITE_POSTS_CONTRACT_ADRRESS; 

export default async function usePostsContract() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found. Please install it.");
  }

   await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum); // ethers v6
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, Posts.abi, signer);

  return contract;
}
