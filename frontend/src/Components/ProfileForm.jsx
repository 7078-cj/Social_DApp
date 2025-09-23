import React, { useContext, useState } from 'react'
import useProfileContract from '../hooks/useProfile';
import ContractContext from '../Contexts/Contracts';

function ProfileForm() {
    const {profileContract} = useContext(ContractContext)
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!file) {
        alert("Please upload an avatar!");
        return;
      }

      try {
        // 1. Upload to FastAPI
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://localhost:8000/upload/", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        const avatarURI = data.uri;

        
        const tx = await profileContract.createProfile(displayName, bio, avatarURI);
        await tx.wait();

        alert("Profile created successfully!");
      } catch (err) {
        console.error(err);
        alert("Error creating profile");
      }
    }


  return (
     <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-96 mx-auto mt-10">
      <input
        type="text"
        placeholder="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="border p-2"
        required
      />
      <textarea
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="border p-2"
        required
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border p-2"
        required
      />
      <button type="submit" className="bg-blue-500 text-white py-2 rounded">
        Create Profile
      </button>
    </form>
  )
}

export default ProfileForm