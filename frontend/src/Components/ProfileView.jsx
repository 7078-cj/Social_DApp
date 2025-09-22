import React, { useEffect, useState } from "react";
import useProfileContract from '../hooks/useProfile';

function ProfileView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const contract = await useProfileContract();

        // get connected account
        const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });

        const data = await contract.getProfile(account);

        setProfile({
          displayName: data.displayName,
          bio: data.bio,
          avatarURI: data.avatarURI,
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>No profile found. Please create one.</p>;

  return (
    <div className="p-4 border rounded w-96 mx-auto mt-6 shadow">
      <img
        src={profile.avatarURI}
        alt="Avatar"
        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
      />
      <h2 className="text-xl font-bold text-center">{profile.displayName}</h2>
      <p className="text-gray-600 text-center mt-2">{profile.bio}</p>
    </div>
  );
}

export default ProfileView;
