import firebase from 'firebase';
import { useEffect, useState } from 'react';
import { createContext, ReactNode } from 'react';
import { auth } from '../services/firebase';

type authContextType = {
  user: user | undefined;
  signInWithGoogle: () => Promise<void>;
}

type user = {
 id: string;
 name: string;
 avatar: string;
}

type authContextProviderProps = {
  children: ReactNode;
}

export const authContext = createContext({} as authContextType);

export function AuthContextProvider(props: authContextProviderProps) {
  const [user, setUser] = useState<user>();
  useEffect(() => {
    const unSubscribe = auth.onAuthStateChanged(user => {
        if(user) {
          const { displayName, photoURL, uid} = user
          if (!displayName || !photoURL) {
            throw new Error('Missing information from google account.');
          }
          setUser({
            id: uid,
            name: displayName,
            avatar: photoURL
          })
      }
    });

    return () => {
      unSubscribe();
    }
  } ,[])

  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider)
      if(result.user) {
        const { displayName, photoURL, uid} = result.user
        if (!displayName || !photoURL) {
          throw new Error('Missing information from google account.');
        }
        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL
        })
      }
    };
  return (
<authContext.Provider value={{user, signInWithGoogle}} >
 {props.children}
</authContext.Provider>
  );
}