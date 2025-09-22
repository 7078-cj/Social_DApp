import React, { useEffect, useState } from "react";
import PostCard from "./PostCard";
import usePostsContract from "../hooks/usePost";
import UpdatePostModal from "./UpdatePostModal";


function PostsList() {
  const [posts, setPosts] = useState([]);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  // modal state
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);

  useEffect(() => {
    const init = async () => {
      const postsContract = await usePostsContract(setAccount);
      setContract(postsContract);

      await loadPosts(postsContract);
    };
    init();
  }, []);

  const loadPosts = async (postsContract) => {
    const loadedPosts = [];
    let id = 1;
    try {
      while (true) {
        const post = await postsContract.getPost(id);
        loadedPosts.push(post);
        id++;
      }
    } catch {
      console.log("All posts loaded.");
    }
    setPosts(loadedPosts);
  };

  const handleDelete = async (id) => {
    try {
      const tx = await contract.deletePost(id);
      await tx.wait();
      await loadPosts(contract);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id, newContent, newImage, newCaption) => {
    try {
      const tx = await contract.updatePost(id, newContent, newImage, newCaption);
      await tx.wait();
      await loadPosts(contract);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (id) => {
    try {
      const tx = await contract.likePost(id);
      await tx.wait();
      await loadPosts(contract);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnlike = async (id) => {
    try {
      const tx = await contract.unlikePost(id);
      await tx.wait();
      await loadPosts(contract);
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

      {/* Update Modal */}
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
