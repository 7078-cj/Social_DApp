import React, { useContext, useState } from "react";
import ContractContext from "../Contexts/Contracts";
import PostCard from "./PostCard";

function ProfileView({ profile }) {
  const {
    account,
    profileContract,
    posts,
    fetchProfile,
    postsContract,
    fetchPosts,
     handleDelete, handleLike, handleUnlike, handleUpdate
  } = useContext(ContractContext);

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [file, setFile] = useState(null);

  const isOwner =
    account && profile && account.toLowerCase() === profile.account?.toLowerCase();

  // ---- Profile Update Flow with FastAPI Upload ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload an avatar!");
      return;
    }

    try {
      // Upload image to FastAPI
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const avatarURI = data.uri;

      // Update blockchain profile
      const tx = await profileContract.updateProfile(
        displayName,
        bio,
        avatarURI
      );
      await tx.wait();

      await fetchProfile(account);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error updating profile");
    }
  };

  // ---- Editing Mode ----
  if (editing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="p-4 border rounded w-96 mx-auto mt-6 shadow"
      >
        <h2 className="text-xl font-bold text-center mb-4">Edit Profile</h2>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display Name"
          className="border rounded w-full p-2 mb-2"
        />
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          className="border rounded w-full p-2 mb-2"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border rounded w-full p-2 mb-2"
        />

        <div className="flex justify-between mt-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-4 py-2 rounded bg-gray-400 text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Save
          </button>
        </div>
      </form>
    );
  }

  // ---- Normal Profile View ----
  return (
    <div className="p-4 border rounded w-96 mx-auto mt-6 shadow">
      <img
        src={profile.avatarURI}
        alt="Avatar"
        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
      />
      <h2 className="text-xl font-bold text-center">{profile.displayName}</h2>
      <p className="text-gray-600 text-center mt-2">{profile.bio}</p>

      {isOwner && (
        <button
          onClick={() => setEditing(true)}
          className="mt-4 w-full px-4 py-2 rounded bg-green-600 text-white"
        >
          Edit Profile
        </button>
      )}

      {/* User’s Posts */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">My Posts</h3>
        {posts
          .filter(
            (post) =>
              post.author?.toLowerCase() === profile.account?.toLowerCase()
          )
          .map((post) => (
            <PostCard
              key={post.id}
              post={post}
              account={account}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onLike={handleLike}
              onUnlike={handleUnlike}
            />
          ))}
      </div>
    </div>
  );
}

export default ProfileView;
