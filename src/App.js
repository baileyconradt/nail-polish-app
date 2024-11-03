import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, storage, auth } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Auth from './Auth';
import { signOut } from 'firebase/auth';
import './App.css';


const App = () => {
  const [user, setUser] = useState(null);
  const [nailPolishes, setNailPolishes] = useState([]);
  const [newPolish, setNewPolish] = useState({ title: "", hexCode: "", description: "", image: null });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => setUser(user));
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Update the state to null on logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const fetchNailPolishes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "nailPolishes"));
      const nailPolishesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched Nail Polishes:", nailPolishesData); // Debugging line
      setNailPolishes(nailPolishesData);
    } catch (error) {
      console.error("Error fetching nail polishes:", error);
    }
  };

  useEffect(() => {
    console.log('hi')
    console.log(user)
    if (user) { fetchNailPolishes(); }
  }, [user]);

  const handleFileChange = (e) => {
    setNewPolish({ ...newPolish, image: e.target.files[0] });
  };

  const handleAddNailPolish = async (e) => {
    e.preventDefault();
    if (newPolish.image) {
      const imageRef = ref(storage, `nailPolishes/${newPolish.image.name}`);
      await uploadBytes(imageRef, newPolish.image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, "nailPolishes"), {
        title: newPolish.title,
        hexCode: newPolish.hexCode,
        description: newPolish.description,
        imageUrl,
      });

      setNewPolish({ title: "", hexCode: "", description: "", image: null });
      fetchNailPolishes();
    }
  };

  return user ? (
    <div className="app-container">
      <header className="app-header">
        <h1>Nail Polish Collection</h1>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>
  
      <form onSubmit={handleAddNailPolish} className="polish-form">
        <input type="text" placeholder="Title" value={newPolish.title} onChange={(e) => setNewPolish({ ...newPolish, title: e.target.value })} required />
        <input type="text" placeholder="Hex Code" value={newPolish.hexCode} onChange={(e) => setNewPolish({ ...newPolish, hexCode: e.target.value })} required />
        <textarea placeholder="Description" value={newPolish.description} onChange={(e) => setNewPolish({ ...newPolish, description: e.target.value })} required />
        <input type="file" onChange={handleFileChange} required />
        <button type="submit" className="submit-button">Add Nail Polish</button>
      </form>
  
      <div className="nail-polish-cards">
        {nailPolishes.map(({ id, title, hexCode, description, imageUrl }) => (
          <div key={id} className="nail-polish-card" style={{ borderColor: hexCode }}>
            <img src={imageUrl} alt={title} style={{ width: "100px", height: "100px" }} />
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <Auth onAuthSuccess={() => fetchNailPolishes()} />
  );
  
};

export default App;
