import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import socket from "../utils/socket";

export default function Me() {
  const { firebaseUser, dbUser } = useAuth();
  const navigate = useNavigate();

  console.log(firebaseUser);
  if (firebaseUser === undefined) return <p>Loading...</p>;
  if (!firebaseUser) {
    navigate("/login");
    return null;
  }

  const handleLogout = async () => {
    await fetch("/ad-auth/sessionLogout", { method: "POST", credentials: "include" });
    await signOut(auth);
    socket.disconnect(); // drop the authenticated socket so the next user starts fresh
    navigate("/login");
  };

  return (
    <div>
      <h1>{dbUser?.userName ?? firebaseUser.email}</h1>
      {dbUser?.avatarUrl && (
        <img src={dbUser.avatarUrl} alt="avatar" />
      )}
      <p>Email: {firebaseUser.email}</p>
      <p>User ID: {dbUser?.userId}</p>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
}
