import React, { createContext, use, useEffect, useState } from "react";
import useProfileContract from "../hooks/useProfile";
import usePostsContract from "../hooks/usePost";
import useCommentsContract from "../hooks/useComments";
import usePlatformTokenContract from "../hooks/usePlatformToken";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


const ContractContext = createContext();
export default ContractContext;

export function Contracts({ children }) {
  const [profileContract, setProfileContract] = useState();
  const [postsContract, setPostsContract] = useState();
  const [commentsContract, setCommentsContract] = useState();
  const [tokenContract, setTokenContract] = useState();

  const [account, setAccount] = useState();
  const [profile, setProfile] = useState(
    () => JSON.parse(localStorage.getItem("profile")) || null
  );
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [tokenBalance, setTokenBalance] = useState("0");

  const nav = useNavigate();

  // Initialize contracts
  useEffect(() => {
    const initContracts = async () => {
      try {
        const profileC = await useProfileContract();
        setProfileContract(profileC);

        const postsC = await usePostsContract(setAccount);
        setPostsContract(postsC);
        console.log("Posts Contract:", postsC);
        console.log("Account:", account);

        const commentsC = await useCommentsContract();
        setCommentsContract(commentsC);

        const tokenC = await usePlatformTokenContract();
        setTokenContract(tokenC);
      } catch (err) {
        console.error("Error initializing contracts:", err);
      }
    };
    initContracts();
  }, []);

  // Fetch profile
  const fetchProfile = async (otherAccount = null) => {
    if (!profileContract) return;
    try {
      setLoading(true);
      const target = otherAccount || account;
      const data = await profileContract.getProfile(target);
      const userProfile = {
        account: target,
        displayName: data.displayName,
        bio: data.bio,
        avatarURI: data.avatarURI,
        balance: data.balance?.toString?.() ?? "0",
        exists: data.exists,
      };
      if (otherAccount) return userProfile;
      if (data && data.exists) {
        setProfile(userProfile);
        localStorage.setItem("profile", JSON.stringify(userProfile));
      } else {
        setProfile(null);
        localStorage.removeItem("profile");
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
    fetchProfile();
  }, [account]);

  // Fetch posts
  const fetchPosts = async () => {
    if (!postsContract) return;
    try {
      const allPosts = await postsContract.getAllPosts();
      const mapped = allPosts.map((entry) => ({
        id: entry.post.id?.toString?.() ?? "0",
        author: entry.post.author ?? "0x0",
        caption: entry.post.caption ?? "",
        content: entry.post.content ?? "",
        imageURI: entry.post.imageURI ?? "",
        timestamp: entry.post.timestamp?.toString?.() ?? "0",
        likes: entry.post.likes?.toString?.() ?? "0",
        commentsCount: entry.post.commentsCount?.toString?.() ?? "0",
        price: entry.post.price?.toString?.() ?? "0",
        owner: entry.post.owner ?? "0x0",
        sellable: entry.post.sellable ?? false,
        profile: entry.profile ? {
          account: entry.profile.account,
          displayName: entry.profile.displayName,
          bio: entry.profile.bio,
          avatarURI: entry.profile.avatarURI,
        } : null,
      }));
      setPosts(mapped);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };



  // Fetch comments
  const fetchComments = async (postId) => {
    if (!commentsContract) return [];
    try {
      const allComments = await commentsContract.getComments(postId);
      const formatted = allComments.map((entry) => ({
        id: entry.comment.id?.toString?.() ?? "0",
        author: entry.comment.author ?? "0x0",
        content: entry.comment.content ?? "",
        timestamp: entry.comment.timestamp?.toString?.() ?? "0",
        profile: entry.profile ? {
          account: entry.profile.account,
          displayName: entry.profile.displayName,
          bio: entry.profile.bio,
          avatarURI: entry.profile.avatarURI,
        } : null,
      }));
      setComments(formatted);
      return formatted;
    } catch (err) {
      console.error("Error fetching comments:", err);
      return [];
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [postsContract]);

  // Fetch token balance
  const fetchTokenBalance = async () => {
    if (!tokenContract || !account) return;
    try {
      const balance = await tokenContract.balanceOf(account);
      setTokenBalance(balance?.toString?.() ?? "0");
    } catch (err) {
      console.error("Error fetching token balance:", err);
    }
  };
  useEffect(() => {
    fetchTokenBalance();
  }, [tokenContract, account]);

  // Post operations
  const handleDeletePost = async (postId) => {
    if (!postsContract) return;
    const prev = [...posts];
    setPosts((p) => p.filter((x) => x.id !== postId));
    try {
      const tx = await postsContract.deletePost(postId);
      await tx.wait();
      toast.success("Post deleted!");
    } catch (err) {
      setPosts(prev);
      toast.error("Failed to delete post!");
    }
  };

  const handleUpdatePost = async (postId, caption, content, imageURI) => {
    if (!postsContract) return;
    const prev = [...posts];
    setPosts((p) =>
      p.map((x) => (x.id === postId ? { ...x, caption, content, imageURI } : x))
    );
    try {
      const tx = await postsContract.updatePost(postId, caption, content, imageURI);
      await tx.wait();
      toast.success("Post updated!");
    } catch (err) {
      setPosts(prev);
      toast.error("Failed to update post!");
    }
  };

  const toggleSellable = async (postId, sellable) => {
    if (!postsContract) return;
    try {
      const tx = await postsContract.setSellable(postId, sellable);
      await tx.wait();
      toast.success("Sellable status updated!");
      fetchPosts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update sellable!");
    }
  };

  const buyPost = async (postId, price) => {
    if (!postsContract) return;
    try {
      const tx = await postsContract.buyPost(postId, { value: price });
      await tx.wait();
      toast.success("Post bought!");
      fetchPosts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to buy post!");
    }
  };

  const likePost = async (postId) => {
    if (!postsContract) return;
    try {
      const tx = await postsContract.likePost(postId);
      await tx.wait();
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  // Comment operations
  const addComment = async (postId, content) => {
    if (!commentsContract) return;
    try {
      const tx = await commentsContract.addComment(postId, content);
      await tx.wait();
      toast.success("Comment added!");
      fetchComments(postId);
      fetchPosts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add comment!");
    }
  };

  const updateComment = async (commentId, content, postId) => {
    if (!commentsContract) return;
    try {
      const tx = await commentsContract.updateComment(commentId, content);
      await tx.wait();
      toast.success("Comment updated!");
      fetchComments(postId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update comment!");
    }
  };

  const deleteComment = async (commentId, postId) => {
    if (!commentsContract) return;
    try {
      const tx = await commentsContract.deleteComment(commentId);
      await tx.wait();
      toast.success("Comment deleted!");
      fetchComments(postId);
      fetchPosts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete comment!");
    }
  };

  // Context value
  const context = {
    profileContract,
    postsContract,
    commentsContract,
    tokenContract,
    account,
    profile,
    setProfile,
    loading,
    posts,
    comments,
    tokenBalance,
    fetchProfile,
    fetchPosts,
    fetchComments,
    fetchTokenBalance,
    handleDeletePost,
    handleUpdatePost,
    toggleSellable,
    buyPost,
    likePost,
    addComment,
    updateComment,
    deleteComment,
  };

  return (
    <ContractContext.Provider value={context}>
      {children}
    </ContractContext.Provider>
  );
}
