import React, { useContext, useState } from "react";
import usePostsContract from "../hooks/usePost";
import { Contract } from "ethers";
import ContractContext from "../Contexts/Contracts";



function CreatePostForm() {
  const {postsContract} = useContext(ContractContext)
  const [caption, setCaption] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption || !content) {
      alert("Caption and content are required!");
      return;
    }

    setLoading(true);

    try {
     
      let imageURI = "";
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://localhost:8000/upload/", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        imageURI = data.uri;
      }


 
      const tx = await postsContract.createPost(content, imageURI, caption);
      await tx.wait();

      alert("Post created successfully!");
      setCaption("");
      setContent("");
      setFile(null);

      
    } catch (err) {
      console.error(err);
      alert("Error creating post");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-96 mx-auto mt-6 border p-4 rounded shadow"
    >
      <h2 className="text-lg font-bold">Create Post</h2>

      <input
        type="text"
        placeholder="Caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="border p-2 rounded"
        required
      />

      <textarea
        placeholder="Write something..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border p-2 rounded"
        rows={4}
        required
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border p-2 rounded"
      />

      <button
        type="submit"
        className="bg-green-500 text-white py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Posting..." : "Create Post"}
      </button>
    </form>
  );
}

export default CreatePostForm;
