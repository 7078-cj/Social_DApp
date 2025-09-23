import React, { useContext, useState } from "react";
import ContractContext from "../Contexts/Contracts";

function ProfileView({ profile }) {
  const { account, profileContract, fetchProfile } = useContext(ContractContext);

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [avatarURI, setAvatarURI] = useState(profile.avatarURI);

  const isOwner = account && profile && account.toLowerCase() === profile.owner?.toLowerCase();

  const handleUpdate = async () => {
    try {
      const tx = await profileContract.updateProfile(displayName, bio, avatarURI);
      await tx.wait();

      await fetchProfile(account); 
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (editing) {
    return (
      <div className="p-4 border rounded w-96 mx-auto mt-6 shadow">
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
          type="text"
          value={avatarURI}
          onChange={(e) => setAvatarURI(e.target.value)}
          placeholder="Avatar URL"
          className="border rounded w-full p-2 mb-2"
        />

        <div className="flex justify-between mt-2">
          <button
            onClick={() => setEditing(false)}
            className="px-4 py-2 rounded bg-gray-400 text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

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
    </div>
  );
}

export default ProfileView;
