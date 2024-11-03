import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import './App.css';

const Auth = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (error) {
      console.error("Error with authentication", error);
    }
  };

  return (
    <div className="auth-container">
    <h2>{isSignUp ? "Sign Up" : "Log In"}</h2>
    <form onSubmit={handleAuth}>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">{isSignUp ? "Sign Up" : "Log In"}</button>
    </form>
    <button onClick={() => setIsSignUp(!isSignUp)} className="switch-mode">
      {isSignUp ? "Switch to Log In" : "Switch to Sign Up"}
    </button>
  </div>
  
  );
};

export default Auth;
