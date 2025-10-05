import React, { useContext, useState } from "react";
import ContractContext from "../Contexts/Contracts";

function CreatePostForm() {
  const { postsContract } = useContext(ContractContext);
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

      const tx = await postsContract.createPost(caption,content, imageURI, false)
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
      className="bg-white rounded-xl shadow p-5 w-full"
    >
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Post</h2>

      {/* Caption */}
      <input
        type="text"
        placeholder="What's your caption?"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
        required
      />

      {/* Content */}
      <textarea
        placeholder="Write something..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 mt-3 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
        rows={4}
        required
      />

      {/* File Upload */}
      <div className="mt-3">
        <label className="block text-gray-600 text-sm mb-1">Upload Image</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 
                     file:rounded-lg file:border-0 file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
        />
      </div>

      {/* Preview */}
      {file && (
        <img
          src={URL.createObjectURL(file)}
          alt="Preview"
          className="mt-3 w-full h-48 object-cover rounded-lg border"
        />
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-medium shadow 
                   hover:bg-blue-700 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Posting..." : "Create Post"}
      </button>
    </form>
  );
}

export default CreatePostForm;
