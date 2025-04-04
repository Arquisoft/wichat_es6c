import React, { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const SessionContext = createContext();

const SessionProvider = ({ children }) => {
    
    const [sessionId, setSessionId] = useState('');
    const [username, setUsername] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
  
    // Recovers user data from localstorage
    useEffect(() => {
      const storedSessionId = localStorage.getItem('sessionId');
      if (storedSessionId) {
        setSessionId(storedSessionId);
        setIsLoggedIn(true);
        
        // Get the username using the sessionID
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      }
    }, []);
  
    const createSession = (username) => {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      setUsername(username);
      setIsLoggedIn(true);
      localStorage.setItem('sessionId', newSessionId);
      localStorage.setItem('username', username);
    };
  
    const destroySession = () => {
      localStorage.removeItem('sessionId');
      localStorage.removeItem('username');
      setSessionId('');
      setUsername('');
      setIsLoggedIn(false);
    };
  
    return (
      <SessionContext.Provider value={{ sessionId, username, isLoggedIn, createSession, destroySession }}>
        {children}
      </SessionContext.Provider>
    );
  };

export { SessionContext, SessionProvider };
