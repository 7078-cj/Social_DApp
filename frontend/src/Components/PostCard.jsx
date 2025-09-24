import React, { useState } from "react";
import UpdatePostModal from "./UpdatePostModal";
import { Heart, Edit, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PostCard({ post, account, onDelete, onLike, onUnlike }) {
  const isAuthor = post.author.toLowerCase() === account?.toLowerCase();
  const [updateOpen, setUpdateOpen] = useState(false);
  const navigate = useNavigate();

  
  const handleProfileClick = () => {
    navigate(`/profile/${post.author}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md p-5 mb-6 hover:shadow-lg transition">
      {/* Header */}
      <div
        className="flex items-center gap-3 mb-4 cursor-pointer"
        onClick={handleProfileClick}
      >
        <img
          src={post.profile.avatarURI}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover border"
        />
        <div>
          <p className="font-semibold text-gray-800 hover:underline">
            {post.profile.displayName}
          </p>
          <p className="text-xs text-gray-500">{post.author}</p>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-gray-900">{post.caption}</h3>
      <p className="text-gray-700 mt-1">{post.content}</p>

      {post.imageURI && (
        <img
          src={post.imageURI}
          alt="Post"
          className="w-full max-h-96 mt-3 rounded-lg object-cover border"
        />
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-gray-600 text-sm">
        <span className="flex items-center gap-1">
          <Heart className="w-4 h-4 text-red-500" /> {post.likes} Likes
        </span>
      </div>

      {/* Actions */}
      <div className="mt-3 flex gap-3">
        {isAuthor ? (
          <>
            <button
              onClick={() => setUpdateOpen(true)}
              className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition"
            >
              <Edit className="w-4 h-4" /> Update
            </button>
            <button
              onClick={() => onDelete(post.id)}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onLike(post.id)}
              className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              <ThumbsUp className="w-4 h-4" /> Like
            </button>
            <button
              onClick={() => onUnlike(post.id)}
              className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            >
              <ThumbsDown className="w-4 h-4" /> Unlike
            </button>
          </>
        )}
      </div>

      {/* Update Post Modal */}
      <UpdatePostModal
        opened={updateOpen}
        onClose={() => setUpdateOpen(false)}
        post={post}
      />
    </div>
  );
}

export default PostCard;
