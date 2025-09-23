

function ProfileView({profile}) {
  return (
    <div className="p-4 border rounded w-96 mx-auto mt-6 shadow">
      <img
        src={profile.avatarURI}
        alt="Avatar"
        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
      />
      <h2 className="text-xl font-bold text-center">{profile.displayName}</h2>
      <p className="text-gray-600 text-center mt-2">{profile.bio}</p>
    </div>
  );
}

export default ProfileView;
