import React, { useContext, useState, useEffect } from "react";
import ContractContext from "../Contexts/Contracts";
import PostCard from "./PostCard";
import Header from "./Header";

function ProfileView({ userProfile }) {
  const {
    account,
    postsContract,
    profileContract,
    commentsContract,
    fetchProfile,
    handleDelete,
    handleLike,
    handleUnlike,
    handleUpdate,
    handleAddComment,
    tokenBalance,          // ✅ added from context
    fetchTokenBalance,     // ✅ added to refresh balance
  } = useContext(ContractContext);

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [file, setFile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  const isOwner =
    account && userProfile?.account?.toLowerCase() === account.toLowerCase();

  // ✅ Fetch user posts
  const loadUserPosts = async () => {
    if (!postsContract || !userProfile) return;
    try {
      const posts = await postsContract.getUserPosts(userProfile.account);

      const mapped = posts.map((p) => ({
        id: p.post.id.toString(),
        author: p.post.author,
        caption: p.post.caption,
        content: p.post.content,
        imageURI: p.post.imageURI,
        timestamp: p.post.timestamp.toString(),
        likes: p.post.likes.toString(),
        price: p.post.price.toString(),
        profile: {
          displayName: p.profile.displayName,
          bio: p.profile.bio,
          avatarURI: p.profile.avatarURI,
          owner: p.profile.owner,
        },
      }));

      setUserPosts(mapped);

      // Fetch comments for each post (optional, for debugging)
      const formatted = await Promise.all(
        posts.map(async (p) => {
          const comments = await commentsContract.getComments(p.id);
          return { ...p, comments };
        })
      );
      setUserPosts(formatted);
    } catch (err) {
      console.error("Error fetching user posts:", err);
    }
  };

  useEffect(() => {
    loadUserPosts();
    fetchTokenBalance(); // ✅ Load balance whenever profile changes

    // Listen for new comments or post updates
    if (commentsContract) {
      commentsContract.on("CommentAdded", () => loadUserPosts());
    }
    if (postsContract) {
      postsContract.on("PostUpdated", () => loadUserPosts());
    }

    return () => {
      commentsContract?.removeAllListeners("CommentAdded");
      postsContract?.removeAllListeners("PostUpdated");
    };
  }, [postsContract, commentsContract, userProfile]);

  // ---- Profile Update ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let avatarURI = userProfile.avatarURI;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://localhost:8000/upload/", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        avatarURI = data.uri;
      }

      const tx = await profileContract.updateProfile(displayName, bio, avatarURI);
      await tx.wait();

      await fetchProfile(account);
      await fetchTokenBalance(); // ✅ Refresh balance after profile update
      setEditing(false);
      await loadUserPosts();
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("❌ Error updating profile");
    }
  };

  // ---- Edit Mode ----
  if (editing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto mt-8"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Edit Profile
        </h2>

        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display Name"
          className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          rows={3}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full text-sm border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 
                     file:rounded-lg file:border-0 file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 mb-4"
        />

        <div className="flex justify-between gap-4">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="flex-1 py-2 rounded-lg bg-gray-400 text-white font-medium hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </form>
    );
  }

  // ---- Normal Profile View ----
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-auto mt-8">
      <Header />

      {/* Profile Info */}
      <div className="flex flex-col items-center text-center">
        <img
          src={userProfile.avatarURI}
          alt="Avatar"
          className="w-28 h-28 rounded-full border-4 border-blue-100 shadow-md object-cover mb-3"
        />
        <h2 className="text-2xl font-bold text-gray-800">{userProfile.displayName}</h2>
        <p className="text-gray-500 text-sm mt-1">{userProfile.account}</p>
        <p className="text-gray-600 mt-3 max-w-md">{userProfile.bio}</p>

        {/* ✅ Token Balance Display */}
        {isOwner && (
          <div className="mt-4 bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-semibold shadow-sm">
            💰 Token Balance: {userProfile.balance}
          </div>
        )}

        {isOwner && (
          <button
            onClick={() => setEditing(true)}
            className="mt-5 px-6 py-2 rounded-lg bg-green-600 text-white font-medium shadow hover:bg-green-700 transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Posts Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          {isOwner ? "My Posts" : "Posts"}
        </h3>

        <div className="flex flex-col gap-4">
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                account={account}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onLike={handleLike}
                onUnlike={handleUnlike}
                onAddComment={handleAddComment}
              />
            ))
          ) : (
            <p className="text-gray-500 italic text-center">No posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileView;
