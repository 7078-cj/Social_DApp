import React, { useContext, useState } from "react";
import PostCard from "./PostCard";
import UpdatePostModal from "./UpdatePostModal";
import ContractContext from "../Contexts/Contracts";

function PostsList() {
  const { posts, account, postsContract, handleDelete, handleLike, handleUnlike} = useContext(ContractContext);

  const [selectedPost, setSelectedPost] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);

  

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
      />
    </div>
  );
}

export default PostsList;
