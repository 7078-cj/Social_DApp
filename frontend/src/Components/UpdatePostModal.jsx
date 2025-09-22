import React, { useState, useEffect } from "react";
import { Modal, TextInput, Textarea, Button } from "@mantine/core";

function UpdatePostModal({ opened, onClose, post, onUpdate }) {
  const [caption, setCaption] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setCaption(post.caption || "");
      setContent(post.content || "");
      setImage(post.imageURI || "");
      setFile(null); // reset file each time
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption || !content) {
      alert("Caption and content are required!");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload image if new file selected
      let imageURI = image;
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

      // 2. Call parent update handler
      await onUpdate(post.id, content, imageURI, caption);

      onClose();
    } catch (err) {
      console.error(err);
      alert("Error updating post");
    }

    setLoading(false);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Update Post" centered>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextInput
          label="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          required
        />
        <Textarea
          label="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          minRows={3}
          required
        />

        {/* Show current image preview if available */}
        {image && !file && (
          <img
            src={image}
            alt="Current"
            className="w-full h-40 object-cover rounded border"
          />
        )}

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 rounded"
        />

        <Button type="submit" color="blue" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Modal>
  );
}

export default UpdatePostModal;
