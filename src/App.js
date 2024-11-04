import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, storage, auth } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Auth from './Auth';
import { signOut } from 'firebase/auth';
import './App.css';
import { SketchPicker } from 'react-color';

const App = () => {
  const [user, setUser] = useState(null);
  const [nailPolishes, setNailPolishes] = useState([]);
  const [newPolish, setNewPolish] = useState({ title: "", hexCode: "", hsvCode: "", description: "", image: null });
  const [editingPolishId, setEditingPolishId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortOption, setSortOption] = useState("title");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => setUser(user));
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const fetchNailPolishes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "nailPolishes"));
      const nailPolishesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNailPolishes(nailPolishesData);
    } catch (error) {
      console.error("Error fetching nail polishes:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNailPolishes();
    }
  }, [user]);

  const handleFileChange = (e) => {
    setNewPolish({ ...newPolish, image: e.target.files[0] });
  };

  const handleAddOrUpdateNailPolish = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = newPolish.image;

      if (newPolish.image && typeof newPolish.image !== "string") {
        const imageRef = ref(storage, `nailPolishes/${newPolish.image.name}`);
        await uploadBytes(imageRef, newPolish.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      if (editingPolishId) {
        const polishRef = doc(db, "nailPolishes", editingPolishId);
        await updateDoc(polishRef, {
          title: newPolish.title,
          hexCode: newPolish.hexCode,
          hsvCode: newPolish.hsvCode,
          description: newPolish.description,
          imageUrl: imageUrl,
        });
      } else {
        await addDoc(collection(db, "nailPolishes"), {
          title: newPolish.title,
          hexCode: newPolish.hexCode,
          hsvCode: newPolish.hsvCode,
          description: newPolish.description,
          imageUrl: imageUrl,
        });
      }

      setNewPolish({ title: "", hexCode: "", hsvCode: "", description: "", image: null });
      setEditingPolishId(null);
      setShowModal(false);
      fetchNailPolishes();
    } catch (error) {
      console.error("Error adding/updating nail polish:", error);
    }
  };

  const handleEdit = (polish) => {
    setNewPolish({
      title: polish.title,
      hexCode: polish.hexCode,
      hsvCode: polish.hsvCode,
      description: polish.description,
      image: polish.imageUrl,
    });
    setEditingPolishId(polish.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "nailPolishes", id));
      fetchNailPolishes();
    } catch (error) {
      console.error("Error deleting nail polish:", error);
    }
  };

  const sortedNailPolishes = [...nailPolishes].sort((a, b) => {
    if (sortOption === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortOption === "hexCode") {
      return a.hexCode.localeCompare(b.hexCode);
    } else if (sortOption === "colorWarmth") {
      return a.hsvCode.h - b.hsvCode.h; // Assuming hsvCode is [H, S, V]
    }
    return 0;
  });

  return user ? (
    <div className="app-container">
      <header className="app-header">
        <h1>Nail Polish Collection</h1>
        <div className="header-buttons">
        <button className="logout-button" onClick={handleLogout}>Logout</button>
        <button onClick={() => { setNewPolish({}); setShowModal(true); }} className="add-button">Add Nail Polish</button>
        <select onChange={(e) => setSortOption(e.target.value)} value={sortOption} className="sort-dropdown">
          <option value="title">Sort by Title</option>
          <option value="hexCode">Sort by Hex Code</option>
          <option value="colorWarmth">Sort by Color Warmth</option>
        </select>
        </div>
      </header>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={() => setShowModal(false)} className="close-button">X</button>
            <form onSubmit={handleAddOrUpdateNailPolish} className="polish-form">
              <input
                type="text"
                placeholder="Title"
                value={newPolish.title}
                onChange={(e) => setNewPolish({ ...newPolish, title: e.target.value })}
                required
              />
              <SketchPicker
                color={newPolish.hexCode}
                onChangeComplete={(color) => {
                  console.log(color)
                  setNewPolish({ ...newPolish, hexCode: color.hex, hsvCode: [color.hsv.h, color.hsv.s, color.hsv.v] });
                }}
              />
              <textarea
                placeholder="Description"
                value={newPolish.description}
                onChange={(e) => setNewPolish({ ...newPolish, description: e.target.value })}
                required
              />
              <input type="file" onChange={handleFileChange} />
              <button type="submit" className="submit-button">
                {editingPolishId ? "Update Nail Polish" : "Add Nail Polish"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="nail-polish-cards">
        {sortedNailPolishes.map(({ id, title, hexCode, hsvCode, description, imageUrl }) => (
          <div key={id} className="nail-polish-card" style={{ borderColor: hexCode }}>
            <img src={imageUrl} alt={title} />
            <h3>{title}</h3>
            <p>{description}</p>
            <div className="hex-display">
              <div className="color-circle" style={{ backgroundColor: hexCode }}></div>
              <span>{hexCode}</span>
            </div>
            <button className="submit-button" onClick={() => handleEdit({ id, title, hexCode, hsvCode, description, imageUrl })}>Edit</button>
            <button className="submit-button" onClick={() => handleDelete(id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <Auth onAuthSuccess={() => fetchNailPolishes()} />
  );
};

export default App;
