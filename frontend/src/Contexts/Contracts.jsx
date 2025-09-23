import React, { createContext, useEffect, useState } from 'react';
import useProfileContract from '../hooks/useProfile';
import usePostsContract from '../hooks/usePost';
import { useNavigate } from 'react-router-dom';

const ContractContext = createContext();
export default ContractContext;

export function Contracts({ children }) {
  const [profileContract, setProfileContract] = useState();
  const [postsContract, setPostsContract] = useState();
  const [account, setAccount] = useState();
  const [profile, setProfile] = useState(
    () => JSON.parse(localStorage.getItem("profile")) || null
  );
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const nav = useNavigate();

  const fetchProfile = async (otherAccount = null) => {
    try {
      setLoading(true);
      const data = await profileContract.getProfile(otherAccount ? otherAccount : account);

      if (data && data.exists) {
        const userProfile = {
          displayName: data.displayName,
          bio: data.bio,
          avatarURI: data.avatarURI,
        };

        setProfile(userProfile);
        localStorage.setItem("profile", JSON.stringify(userProfile)); 
        
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile(null);
      localStorage.removeItem("profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initContracts = async () => {
      try {
        const profile_contract = await useProfileContract();
        setProfileContract(profile_contract);

        const posts_contract = await usePostsContract(setAccount);
        setPostsContract(posts_contract);
      } catch (err) {
        console.error("Error initializing contracts:", err);
      }
    };

    initContracts();
  }, []);

  useEffect(() => {
    if (!profileContract || !account) {
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [profileContract, account]);

  useEffect(() => {
    if (!postsContract) return;

    const loadPosts = async () => {
      const loadedPosts = [];
      let id = 1;
      try {
        while (true) {
          const post = await postsContract.getPost(id);
          loadedPosts.push(post);
          id++;
        }
      } catch {
        console.log("All posts loaded.");
      }
      setPosts(loadedPosts);
    };

    loadPosts();

    postsContract.on("PostCreated", async (postId) => {
      const newPost = await postsContract.getPost(postId);
      setPosts((prev) => [...prev, newPost]);
    });

    postsContract.on("PostUpdated", async (postId) => {
      const updatedPost = await postsContract.getPost(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id.toString() === postId.toString() ? updatedPost : p))
      );
    });

    postsContract.on("PostDeleted", (postId) => {
      setPosts((prev) => prev.filter((p) => p.id.toString() !== postId.toString()));
    });

    postsContract.on("PostLiked", async (postId) => {
      const updatedPost = await postsContract.getPost(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id.toString() === postId.toString() ? updatedPost : p))
      );
    });

    postsContract.on("PostUnliked", async (postId) => {
      const updatedPost = await postsContract.getPost(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id.toString() === postId.toString() ? updatedPost : p))
      );
    });

    return () => {
      postsContract.removeAllListeners("PostCreated");
      postsContract.removeAllListeners("PostUpdated");
      postsContract.removeAllListeners("PostDeleted");
      postsContract.removeAllListeners("PostLiked");
      postsContract.removeAllListeners("PostUnliked");
    };
  }, [postsContract]);

  const context = {
    profileContract,
    postsContract,
    account,
    profile,
    loading,
    posts,
    fetchProfile
  };

  return (
    <ContractContext.Provider value={context}>
      {children}
    </ContractContext.Provider>
  );
}
