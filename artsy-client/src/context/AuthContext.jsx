import {createContext, useContext, useEffect, useState, useCallback,} from "react";

//import backend api
//const API_BASE_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  //user data from firebase
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading
  //user data from database
  const [dbUser, setDbUser] = useState(null);

  //refresh authentication info in cookie
  const refreshAuth = useCallback(async () => {
    console.log("checking session");
    try {
      const res = await fetch(`/api/check-auth`, { credentials: "include" });
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
        console.log("OK");
      } else {
        setFirebaseUser(null);
        setDbUser(null);
        console.log("NOT OK");
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
