import React from "react";
import PostsList from "../Components/PostList";
import CreatePostForm from "../Components/CreatePostForm";
import Header from "../Components/Header";

function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <Header/>

        {/* Create Post Section */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4">Create a new post</h2>
          <CreatePostForm />
        </div>

        {/* Divider */}
        <hr className="border-gray-300" />

        {/* Posts Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Recent Posts</h2>
          <PostsList />
        </div>
      </div>
    </div>
  );
}

export default Home;
