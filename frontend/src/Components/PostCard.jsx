import React, { useState, useContext, useEffect } from "react";
import UpdatePostModal from "./UpdatePostModal";
import { Heart, Edit, Trash2, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ContractContext from "../Contexts/Contracts";


function PostCard({ post }) {
  const {
    account,
    handleLike,
    handleUnlike,
    handleDelete,
    addComment,
    fetchComments,
    commentsContract,
    tokenBalance,
    updateComment,
    deleteComment
  } = useContext(ContractContext);

  const isAuthor = post.author.toLowerCase() === account?.toLowerCase();
  const [updateOpen, setUpdateOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postComments, setPostComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const navigate = useNavigate();

  // 🔹 Fetch comments when post loads
  useEffect(() => {
    const loadComments = async () => {
      if (!commentsContract) return;
      setLoadingComments(true);
      const fetched = await fetchComments(post.id);
      setPostComments(fetched);
      setLoadingComments(false);
    };
    loadComments();

    // Listen for real-time comment updates
    if (commentsContract) {
      commentsContract.on("CommentAdded", (postId) => {
        if (Number(postId) === Number(post.id)) loadComments();
      });
      commentsContract.on("CommentDeleted", (postId) => {
        if (Number(postId) === Number(post.id)) loadComments();
      });
    }

    return () => {
      if (commentsContract) {
        commentsContract.removeAllListeners("CommentAdded");
        commentsContract.removeAllListeners("CommentDeleted");
      }
    };
  }, [commentsContract, post.id]);

  const handleProfileClick = () => {
    navigate(`/profile/${post.author}`);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment(post.id, commentText);
      setCommentText("");
      const updated = await fetchComments(post.id);
      setPostComments(updated);
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
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
        <span className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4 text-blue-500" />{" "}
          {postComments.length} Comments
        </span>
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-3">
        {isAuthor ? (
          <>
            <button
              onClick={() => setUpdateOpen(true)}
              className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition"
            >
              <Edit className="w-4 h-4" /> Update
            </button>
            <button
              onClick={() => handleDelete(post.id)}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleLike(post.id)}
              className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              <ThumbsUp className="w-4 h-4" /> Like
            </button>
            <button
              onClick={() => handleUnlike(post.id)}
              className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            >
              <ThumbsDown className="w-4 h-4" /> Unlike
            </button>
          </>
        )}
      </div>

      <div className="mt-6 border-t pt-3">
  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
    <MessageCircle className="w-4 h-4" /> Comments
  </h4>

      {loadingComments ? (
        <p className="text-gray-500 text-sm">Loading comments...</p>
      ) : postComments.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {postComments.map((c) => (
            <div
              key={c.id}
              className="flex items-start space-x-2 bg-gray-50 p-2 rounded-lg border border-gray-100"
            >
              {/* 🔹 Commenter Avatar */}
              <img
                src={
                  c.profile.avatarURI && c.profile.avatarURI.trim() !== ""
                    ? c.profile.avatarURI
                    : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />

              {/* 🔹 Comment Details */}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-800">
                    {c.profile.displayName || "Anonymous"}
                  </p>

                  {/* 🔸 Show Edit/Delete only if this is the current user's comment */}
                  {account?.toLowerCase() === c.author?.toLowerCase() && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const newContent = prompt(
                            "Edit your comment:",
                            c.content
                          );
                          if (newContent && newContent.trim() !== "") {
                            updateComment(c.id, newContent);
                          }
                        }}
                        className="text-blue-500 hover:text-blue-700 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteComment(c.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 break-words">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No comments yet.</p>
      )}

      {/* Add Comment */}
      <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
        <input
          type="text"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-grow border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-300 outline-none"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          Post
        </button>
      </form>
    </div>

      {/* Update Post Modal */}
      <UpdatePostModal
        opened={updateOpen}
        onClose={() => setUpdateOpen(false)}
        post={post}
      />

      {/* Token Info */}
      <div className="mt-4 text-xs text-gray-500 text-right">
        💰 Your Balance: {tokenBalance} PTKN
      </div>
    </div>
  );
}

export default PostCard;
