import React, { createContext, useEffect, useState } from "react";
import useProfileContract from "../hooks/useProfile";
import usePostsContract from "../hooks/usePost";
import { useNavigate } from "react-router-dom";

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

  // 🔹 Fetch profile (self or other user)
  const fetchProfile = async (otherAccount = null) => {
    try {
      setLoading(true);
      const data = await profileContract.getProfile(
        otherAccount ? otherAccount : account
      );

      if (data && data.exists) {
        const userProfile = {
          account: otherAccount ? otherAccount : account,
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

  // 🔹 Init contracts
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

  // 🔹 Fetch profile when contracts + account ready
  useEffect(() => {
    if (!profileContract || !account) {
      setLoading(false);
      return;
    }
    fetchProfile();
  }, [profileContract, account]);

  // 🔹 Fetch posts
  useEffect(() => {
    if (!postsContract) return;

    const loadPosts = async () => {
      try {
        const allPosts = await postsContract.getAllPosts();

        // ✅ Normalize PostWithProfile for React
        const mapped = allPosts.map((p) => ({
          id: p.post.id.toString(),
          author: p.post.author,
          caption: p.post.caption,
          content: p.post.content,
          imageURI: p.post.imageURI,
          timestamp: p.post.timestamp.toString(),
          likes: p.post.likes.toString(),
          profile: {
            displayName: p.profile.displayName,
            bio: p.profile.bio,
            avatarURI: p.profile.avatarURI,
            owner: p.profile.owner,
          },
        }));

        setPosts(mapped);
      } catch (err) {
        console.error("Error loading posts:", err);
      }
    };

    loadPosts();

    // Listen to events and refresh
    postsContract.on("PostCreated", loadPosts);
    postsContract.on("PostUpdated", loadPosts);
    postsContract.on("PostDeleted", loadPosts);
    postsContract.on("PostLiked", loadPosts);
    postsContract.on("PostUnliked", loadPosts);

    return () => {
      postsContract.removeAllListeners("PostCreated");
      postsContract.removeAllListeners("PostUpdated");
      postsContract.removeAllListeners("PostDeleted");
      postsContract.removeAllListeners("PostLiked");
      postsContract.removeAllListeners("PostUnliked");
    };
  }, [postsContract]);

  const handleDelete = async (id) => {
    try {
      const tx = await postsContract.deletePost(id);
      await tx.wait();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id, newContent, newImage, newCaption) => {
    try {
      const tx = await postsContract.updatePost(id, newContent, newImage, newCaption);
      await tx.wait();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (id) => {
    try {
      const tx = await postsContract.likePost(id);
      await tx.wait();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnlike = async (id) => {
    try {
      const tx = await postsContract.unlikePost(id);
      await tx.wait();
    } catch (err) {
      console.error(err);
    }
  };

  const context = {
    profileContract,
    postsContract,
    account,
    profile,
    loading,
    posts,
    fetchProfile,
    handleDelete,
    handleUpdate,
    handleLike,
    handleUnlike,
  };

  return (
    <ContractContext.Provider value={context}>
      {children}
    </ContractContext.Provider>
  );
}
