import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  //user data from firebase
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading
  //user data from database
  const [dbUser, setDbUser] = useState(null);

  //refresh authentication info in cookie
  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/check-auth", { credentials: "include" });
      if (res.ok) {
        const user = await res.json();
        setFirebaseUser({
          uid: user.uid,
          email: user.email,
        });
        setDbUser({
          userId: user.userId,
          userName: user.userName,
          avatarUrl: user.avatarUrl,
        });
      } else {
        setFirebaseUser(null);
        setDbUser(null);
      }
    } catch {
      setFirebaseUser(null);
      setDbUser(null);
    }
  }, []);

  // On page load, check if a valid session cookie exists
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return (
    <AuthContext.Provider value={{ firebaseUser, dbUser, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
