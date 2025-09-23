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
  const [profile, setProfile] = useState();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const nav = useNavigate();

  
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

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await profileContract.getProfile(account);

        if (data && data.exists) {
          setProfile({
            displayName: data.displayName,
            bio: data.bio,
            avatarURI: data.avatarURI,
          });
          nav('/');
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

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

    
    postsContract.on("PostCreated", async (postId, author, content, imageURI) => {
      console.log("PostCreated:", postId.toString());
      const newPost = await postsContract.getPost(postId);
      setPosts((prev) => [...prev, newPost]);
    });

    postsContract.on("PostUpdated", async (postId) => {
      console.log("PostUpdated:", postId.toString());
      const updatedPost = await postsContract.getPost(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id.toString() === postId.toString() ? updatedPost : p))
      );
    });

    postsContract.on("PostDeleted", (postId) => {
      console.log("PostDeleted:", postId.toString());
      setPosts((prev) => prev.filter((p) => p.id.toString() !== postId.toString()));
    });

    postsContract.on("PostLiked", async (postId) => {
      console.log("PostLiked:", postId.toString());
      const updatedPost = await postsContract.getPost(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id.toString() === postId.toString() ? updatedPost : p))
      );
    });

    postsContract.on("PostUnliked", async (postId) => {
      console.log("PostUnliked:", postId.toString());
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
  };

  return (
    <ContractContext.Provider value={context}>
      {children}
    </ContractContext.Provider>
  );
}
