import {createContext, useContext, useEffect, useState, useCallback,} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading
  const [dbUser, setDbUser] = useState(null);
  const [socketToken, setSocketToken] = useState(null);

  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch(`/ad-auth/check-auth`, { credentials: "include" });
      if (res.ok) {
        const user = await res.json();
        if (user.error) {
          setFirebaseUser(null);
          setDbUser(null);
          setSocketToken(null);
        } else {
          setFirebaseUser({ uid: user.uid, email: user.email });
          setDbUser({ userId: user.userId, userName: user.userName, avatarUrl: user.avatarUrl });
          setSocketToken(user.socketToken ?? null);
        }
      } else {
        setFirebaseUser(null);
        setDbUser(null);
        setSocketToken(null);
      }
    } catch {
      setFirebaseUser(null);
      setDbUser(null);
      setSocketToken(null);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return (
    <AuthContext.Provider value={{ firebaseUser, dbUser, socketToken, refreshAuth, authLoading: firebaseUser === undefined }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
