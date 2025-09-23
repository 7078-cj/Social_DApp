import React, { useContext, useState } from "react";
import PostCard from "./PostCard";
import UpdatePostModal from "./UpdatePostModal";
import ContractContext from "../Contexts/Contracts";

function PostsList() {
  const { posts, account, postsContract } = useContext(ContractContext);

  const [selectedPost, setSelectedPost] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);

  const handleDelete = async (id) => {
    try {
      const tx = await postsContract.deletePost(id);
      await tx.wait();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id, newContent, newImage, newCaption) => {
    try {
      const tx = await postsContract.updatePost(id, newContent, newImage, newCaption);
      await tx.wait();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (id) => {
    try {
      const tx = await postsContract.likePost(id);
      await tx.wait();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnlike = async (id) => {
    try {
      const tx = await postsContract.unlikePost(id);
      await tx.wait();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Posts</h2>
      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id.toString()}
            post={post}
            account={account}
            onUpdate={() => {
              setSelectedPost(post);
              setModalOpened(true);
            }}
            onDelete={handleDelete}
            onLike={handleLike}
            onUnlike={handleUnlike}
          />
        ))
      )}

     
      <UpdatePostModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        post={selectedPost}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

export default PostsList;
