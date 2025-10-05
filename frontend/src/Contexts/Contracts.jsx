import React, { createContext, useEffect, useState } from "react";
import useProfileContract from "../hooks/useProfile";
import usePostsContract from "../hooks/usePost";
import useCommentsContract from "../hooks/useComments";
import usePlatformTokenContract from "../hooks/usePlatformToken";
import useSocialPlatformContract from "../hooks/useSocialPlatform";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // Optional for visual feedback

const ContractContext = createContext();
export default ContractContext;

export function Contracts({ children }) {
  const [profileContract, setProfileContract] = useState();
  const [postsContract, setPostsContract] = useState();
  const [commentsContract, setCommentsContract] = useState();
  const [tokenContract, setTokenContract] = useState();
  const [socialPlatformContract, setSocialPlatformContract] = useState();

  const [account, setAccount] = useState();
  const [profile, setProfile] = useState(
    () => JSON.parse(localStorage.getItem("profile")) || null
  );
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [tokenBalance, setTokenBalance] = useState("0");

  const nav = useNavigate();

  // 🔹 Fetch profile
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

  // 🔹 Initialize contracts
  useEffect(() => {
    const initContracts = async () => {
      try {
        const profile_contract = await useProfileContract();
        setProfileContract(profile_contract);

        const posts_contract = await usePostsContract(setAccount);
        setPostsContract(posts_contract);

        const comments_contract = await useCommentsContract();
        setCommentsContract(comments_contract);

        const token_contract = await usePlatformTokenContract();
        setTokenContract(token_contract);

        const social_contract = await useSocialPlatformContract();
        setSocialPlatformContract(social_contract);
      } catch (err) {
        console.error("Error initializing contracts:", err);
      }
    };
    initContracts();
  }, []);

  // 🔹 Fetch profile once ready
  useEffect(() => {
    if (profileContract && account) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [profileContract, account]);

  // 🔹 Fetch posts
  useEffect(() => {
    if (!postsContract) return;

    const loadPosts = async () => {
      try {
        const allPosts = await postsContract.getAllPosts();
        const mapped = allPosts.map((p) => ({
          id: p.post?.id?.toString?.() ?? "0",
          author: p.post?.author ?? "0x0",
          caption: p.post?.caption ?? "",
          content: p.post?.content ?? "",
          imageURI: p.post?.imageURI ?? "",
          timestamp: p.post?.timestamp?.toString?.() ?? "0",
          likes: p.post?.likes?.toString?.() ?? "0",
          price: p.post?.price?.toString?.() ?? "0",
          profile: {
            displayName: p.profile?.displayName ?? "",
            bio: p.profile?.bio ?? "",
            avatarURI: p.profile?.avatarURI ?? "",
            owner: p.profile?.owner ?? "0x0",
          },
        }));

        setPosts(mapped);
      } catch (err) {
        console.error("Error loading posts:", err);
      }
    };

    loadPosts();

    const handlers = {
      PostCreated: loadPosts,
      PostUpdated: loadPosts,
      PostDeleted: loadPosts,
      PostLiked: loadPosts,
      PostUnliked: loadPosts,
    };

    Object.entries(handlers).forEach(([event, fn]) =>
      postsContract.on(event, fn)
    );

    return () => {
      Object.entries(handlers).forEach(([event, fn]) =>
        postsContract.off(event, fn)
      );
    };
  }, [postsContract]);

  // 🔹 Fetch comments for posts
  const fetchComments = async (postId) => {
    if (!commentsContract) return [];
    try {
      const allComments = await commentsContract.getComments(postId);
      if (!Array.isArray(allComments)) return [];

      const formatted = allComments
        .map((c) => {
          const commentData = c.comment ?? c;
          if (!commentData.id) return null;

          return {
            id: commentData.id.toString(),
            author: commentData.author ?? "0x0",
            content: commentData.content ?? "",
            timestamp: commentData.timestamp?.toString?.() ?? "0",
            profile: {
              displayName: c.profile?.displayName ?? "",
              bio: c.profile?.bio ?? "",
              avatarURI: c.profile?.avatarURI ?? "",
              owner: c.profile?.owner ?? "0x0",
            },
          };
        })
        .filter((item) => item !== null);

      setComments(formatted);
      return formatted;
    } catch (err) {
      console.error("Error fetching comments:", err);
      return [];
    }
  };

  // 🔹 Comment event listeners
  useEffect(() => {
    if (!commentsContract) return;

    const onCommentAdded = async () => {
      if (postsContract) {
        try {
          const allPosts = await postsContract.getAllPosts();
          const mapped = allPosts.map((p) => ({
            id: p.post?.id?.toString?.() ?? "0",
            author: p.post?.author ?? "0x0",
            caption: p.post?.caption ?? "",
            content: p.post?.content ?? "",
            imageURI: p.post?.imageURI ?? "",
            timestamp: p.post?.timestamp?.toString?.() ?? "0",
            likes: p.post?.likes?.toString?.() ?? "0",
            price: p.post?.price?.toString?.() ?? "0",
            profile: {
              displayName: p.profile?.displayName ?? "",
              bio: p.profile?.bio ?? "",
              avatarURI: p.profile?.avatarURI ?? "",
              owner: p.profile?.owner ?? "0x0",
            },
          }));
          setPosts(mapped);
        } catch {}
      }
    };

    const onCommentUpdated = () => fetchTokenBalance();
    const onCommentDeleted = () => fetchTokenBalance();

    commentsContract.on("CommentAdded", onCommentAdded);
    commentsContract.on("CommentUpdated", onCommentUpdated);
    commentsContract.on("CommentDeleted", onCommentDeleted);

    return () => {
      commentsContract.off("CommentAdded", onCommentAdded);
      commentsContract.off("CommentUpdated", onCommentUpdated);
      commentsContract.off("CommentDeleted", onCommentDeleted);
    };
  }, [commentsContract, postsContract]);

  // 🔹 Token balance
  const fetchTokenBalance = async () => {
    if (!tokenContract || !account) return;
    try {
      const balance = await tokenContract.balanceOf(account);
      setTokenBalance(balance?.toString?.() ?? "0");
    } catch (err) {
      console.error("Error fetching token balance:", err);
    }
  };

  // 🔹 Optimistic Post Delete
  const handleDelete = async (id) => {
    if (!postsContract) return;
    const prevPosts = [...posts];
    setPosts((prev) => prev.filter((p) => p.id !== id));

    try {
      const tx = await postsContract.deletePost(id);
      toast.loading("Deleting post...");
      await tx.wait();
      toast.dismiss();
      toast.success("Post deleted!");
    } catch (err) {
      console.error("Delete error:", err);
      setPosts(prevPosts);
      toast.dismiss();
      toast.error("Failed to delete post!");
    }
  };

  // 🔹 Optimistic Post Update
  const handleUpdate = async (id, caption, content, imageURI) => {
    if (!postsContract) return;
    const prevPosts = [...posts];
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption, content, imageURI } : p))
    );

    try {
      const tx = await postsContract.updatePost(id, caption, content, imageURI);
      toast.loading("Updating post...");
      await tx.wait();
      toast.dismiss();
      toast.success("Post updated!");
    } catch (err) {
      console.error("Update error:", err);
      setPosts(prevPosts);
      toast.dismiss();
      toast.error("Failed to update post!");
    }
  };

  // 🔹 Like / Unlike
  const handleLike = async (id) => {
    if (!socialPlatformContract) return;
    try {
      const tx = await socialPlatformContract.likePost(id);
      await tx.wait();
      await fetchTokenBalance();
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleUnlike = async (id) => {
    if (!postsContract) return;
    try {
      const tx = await postsContract.unlikePost(id);
      await tx.wait();
    } catch (err) {
      console.error("Unlike error:", err);
    }
  };

  // 🔹 Comment Add / Update / Delete
  const addComment = async (postId, content) => {
    if (!commentsContract) return;
    try {
      const tx = await commentsContract.addComment(postId, content);
      toast.loading("Adding comment...");
      await tx.wait();
      toast.dismiss();
      toast.success("Comment added!");
      await fetchComments(postId);
      await fetchTokenBalance();
    } catch (err) {
      console.error("Add comment error:", err);
      toast.dismiss();
      toast.error("Failed to add comment!");
    }
  };

  // 🔹 Optimistic Comment Update
  const updateComment = async (commentId, newContent) => {
    if (!commentsContract) return;
    const prevComments = [...comments];
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, content: newContent } : c
      )
    );

    try {
      const tx = await commentsContract.updateComment(commentId, newContent);
      toast.loading("Updating comment...");
      await tx.wait();
      toast.dismiss();
      toast.success("Comment updated!");
      await fetchTokenBalance();
    } catch (err) {
      console.error("Update comment error:", err);
      setComments(prevComments);
      toast.dismiss();
      toast.error("Failed to update comment!");
    }
  };

  // 🔹 Optimistic Comment Delete
  const deleteComment = async (commentId) => {
    if (!commentsContract) return;
    const prevComments = [...comments];
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    try {
      const tx = await commentsContract.deleteComment(commentId);
      toast.loading("Deleting comment...");
      await tx.wait();
      toast.dismiss();
      toast.success("Comment deleted!");
    } catch (err) {
      console.error("Delete comment error:", err);
      setComments(prevComments);
      toast.dismiss();
      toast.error("Failed to delete comment!");
    }
  };

  // 🔹 Token mint
  const mintTokens = async (to, amount) => {
    if (!socialPlatformContract) return;
    try {
      const tx = await socialPlatformContract.mintTokens(to, amount);
      await tx.wait();
      await fetchTokenBalance();
    } catch (err) {
      console.error("Mint token error:", err);
    }
  };

  // 🔹 Token events
  useEffect(() => {
    if (!socialPlatformContract) return;

    const onTokensMinted = () => fetchTokenBalance();
    const onCommentRewarded = () => fetchTokenBalance();

    socialPlatformContract.on("TokensMinted", onTokensMinted);
    socialPlatformContract.on("CommentRewarded", onCommentRewarded);

    return () => {
      socialPlatformContract.off("TokensMinted", onTokensMinted);
      socialPlatformContract.off("CommentRewarded", onCommentRewarded);
    };
  }, [socialPlatformContract, tokenContract, account]);

  const context = {
    profileContract,
    postsContract,
    commentsContract,
    tokenContract,
    socialPlatformContract,
    account,
    profile,
    setProfile,
    loading,
    posts,
    comments,
    tokenBalance,
    fetchProfile,
    fetchComments,
    fetchTokenBalance,
    handleDelete,
    handleUpdate,
    handleLike,
    handleUnlike,
    addComment,
    updateComment,
    deleteComment,
    mintTokens,
  };

  return (
    <ContractContext.Provider value={context}>
      {children}
    </ContractContext.Provider>
  );
}
