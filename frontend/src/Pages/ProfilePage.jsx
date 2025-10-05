import React, { useContext, useState, useEffect } from "react";
import ProfileView from "../Components/ProfileView";
import ContractContext from "../Contexts/Contracts";
import { useParams } from "react-router-dom";

function ProfilePage() {
  const { profile, fetchProfile, postsContract } = useContext(ContractContext);
  const { account } = useParams();
  const [otherAccount, setOtherAccount] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  // Fetch posts of a given account
  const fetchUserPosts = async (targetAccount) => {
    try {
      if (!postsContract || !targetAccount) return;

      const rawPosts = await postsContract.getUserPosts(targetAccount);
     

      const formatted = rawPosts.map((p) => ({
        id: Number(p.post.id),
        author: p.post.author,
        caption: p.post.caption,
        content: p.post.content,
        imageURI: p.post.imageURI,
        timestamp: Number(p.post.timestamp),
        likes: Number(p.post.likes),
        price: Number(p.post.price),
        profile: {
          displayName: p.profile.displayName,
          bio: p.profile.bio,
          avatarURI: p.profile.avatarURI,
          account: p.profile.account,
        },
      }));
     
      
      setUserPosts(formatted);
      
    } catch (err) {
      console.error("Error fetching user posts:", err);
    }
  };
  
    

  // Load profile & posts when `account` changes
  useEffect(() => {
    const loadProfileAndPosts = async () => {
      let targetAccount = profile?.account;

      if (account) {
        const data = await fetchProfile(account);
        
        setOtherAccount(data);
        targetAccount = account;
      }

      if (targetAccount) {
        fetchUserPosts(targetAccount);
      }
    };

    loadProfileAndPosts();
    
  }, [account, profile, postsContract]);
  
  

  return (
    <div>
      <ProfileView userProfile={otherAccount ? otherAccount : profile} userPosts={userPosts} />
      
    </div>
  );
}

export default ProfilePage;
