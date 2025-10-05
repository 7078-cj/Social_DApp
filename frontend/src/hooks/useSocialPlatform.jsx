// src/hooks/useContract.ts
import { ethers } from "ethers";
import ABI from "../ABI/SocialPlatform.json"

const CONTRACT_ADDRESS = import.meta.env.VITE_SOCIALPLATFORM_CONTRACT_ADRRESS; 

export default async function usePostsContract(setAccount = null) {
  if (!window.ethereum) {
    throw new Error("MetaMask not found. Please install it.");
  }

   await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum); // ethers v6
  const signer = await provider.getSigner();
  if (setAccount){
    const address = await signer.getAddress();
    setAccount(address);
  }
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);

  return contract;
}
