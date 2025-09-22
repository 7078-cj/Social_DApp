import React from "react";

function PostCard({ post, account, onUpdate, onDelete, onLike, onUnlike }) {
  const isAuthor = post.author.toLowerCase() === account?.toLowerCase();

  return (
    <div className="border p-4 rounded mb-4 shadow">
      <h3 className="font-semibold">{post.caption}</h3>
      <p>{post.content}</p>
      {post.imageURI && (
        <img
          src={post.imageURI}
          alt="Post"
          className="w-64 h-auto mt-2 rounded"
        />
      )}
      <p className="text-sm text-gray-600">Likes: {post.likes.toString()}</p>

      {isAuthor ? (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate(post.id)}
            className="bg-yellow-500 text-white px-3 py-1 rounded"
          >
            Update
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      ) : (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onLike(post.id)}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Like
          </button>
          <button
            onClick={() => onUnlike(post.id)}
            className="bg-gray-500 text-white px-3 py-1 rounded"
          >
            Unlike
          </button>
        </div>
      )}
    </div>
  );
}

export default PostCard;
