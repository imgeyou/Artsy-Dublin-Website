import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import socket from "../utils/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // undefined = still loading; null = not logged in; object = logged in
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [dbUser, setDbUser] = useState(null);

  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/check-auth", { credentials: "include" });
      if (res.ok) {
        const user = await res.json();
        setFirebaseUser({ uid: user.uid, email: user.email });
        setDbUser({
          userId: user.userId,
          userName: user.userName,
          avatarUrl: user.avatarUrl,
        });
        // Always disconnect first so stale socket from  previous user session is never reused. Then reconnect so the server re runs auth middleware
        // with the current session cookie
        socket.disconnect();
        socket.connect();
      } else {
        setFirebaseUser(null);
        setDbUser(null);
        socket.disconnect();
      }
    } catch {
      setFirebaseUser(null);
      setDbUser(null);
      socket.disconnect();
    }
  }, []);

  useEffect(() => {
    refreshAuth();
    
    return () => socket.disconnect();
  }, [refreshAuth]);

  return (
    <AuthContext.Provider value={{ firebaseUser, dbUser, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
