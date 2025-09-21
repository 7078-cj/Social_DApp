// src/hooks/useContract.ts
import { ethers } from "ethers";
import ProfileABI from ".ABI/Posts.json"; 

const CONTRACT_ADDRESS = import.meta.env.VITE_POSTS_CONTRACT_ADRRESS; 

export function usePostsContract() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found. Please install it.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum); // ethers v6
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ProfileABI.abi, signer);

  return contract;
}
