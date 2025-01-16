import React, { useState, useEffect } from 'react';
import './playlist.css';
import axios from 'axios';

function Playlist() {
    const [playlists, setPlaylists] = useState([]);
    const [loggedInUser, setLoggedInUser] = useState({ username: '' });  // ודא שאתה מקבל את המשתמש בהצלחה
    const [playlistName, setPlaylistName] = useState('');
    const [songName, setSongName] = useState('');
    const [songLink, setSongLink] = useState('');
    const [selectedPlaylist, setSelectedPlaylist] = useState('');
    const [token] = useState(localStorage.getItem('token'));
    
    useEffect(() => {
      // טעינת המשתמש מ-localStorage או דרך חיבור לאותו המשתמש
      const user = localStorage.getItem('loggedInUser');
      if (user) {
          setLoggedInUser(JSON.parse(user)); // מטעין את המשתמש המקומי
      }
  }, []);

    
    // Fetch Playlists
    useEffect(() => {
        // אם יש לך token ו-loggeinUser אז תבצע fetchPlaylists
        if (token && loggedInUser?.username) {
            fetchPlaylists();
        }
    }, [token, loggedInUser]); // תלות ב-loggedInUser ו-token

    // פוקנציה להורדת פלייליסטים
    const fetchPlaylists = async () => {
        try {
            const username = loggedInUser?.username; // השתמש ב-loggedInUser למשתמש
            console.log('Received username:', username);  // בודק אם שם המשתמש מוגדר
            const response = await axios.get('http://localhost:5000/api/playlists', {
                params: { username }, // שלח את שם המשתמש בבקשה
                headers: { Authorization: Bearer ${token} },
            });
            setPlaylists(response.data); // עדכן את הפלייליסטים
            console.log('playlist:',response.data );
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };

    // פוקנציה ליצירת פלייליסט
    const handleCreatePlaylist = async () => {
      console.log('LoggedInUser:', loggedInUser);
      if (!playlistName) {
          alert("Please enter a playlist name.");
          return;
      }
      try {
          const response = await axios.post('http://localhost:5000/createPlaylist', {
              username: loggedInUser.username, // השתמש בשם המשתמש
              playlistName,
          });
          console.log('Playlist created:', response.data); // הדפסת תוצאות יצירת הפלייליסט
          fetchPlaylists(); // עדכון הפלייליסטים
          setPlaylistName(''); // ניקוי השדה
      } catch (error) {
          console.error('Error creating playlist:', error);
      }
    };

    // פוקנציה להוספת שיר לפלייליסט
    const handleAddSong = async () => {
        if (selectedPlaylist && songName && songLink) {
            try {
                const response = await axios.post('http://localhost:5000/addSongToPlaylist', {
                    username: loggedInUser?.username, // השתמש בשם המשתמש
                    playlistName: selectedPlaylist,
                    songName,
                    songLink,
                });
                console.log('Song added:', response.data); // הדפסת תוצאות הוספת השיר
                setSongName(''); // ניקוי השדה של השיר
                setSongLink(''); // ניקוי השדה של הקישור
            } catch (error) {
                console.error('Error adding song:', error);
            }
        } else {
            alert('Please fill all the fields.');
        }
    };

    // פוקנציה למחיקת פלייליסט
    const handleDeletePlaylist = async (playlistName) => {
        try {
            const response = await axios.post('http://localhost:5000/deletePlaylist', {
                username: loggedInUser?.username, // השתמש בשם המשתמש
                playlistName,
            });
            console.log('Playlist deleted:', response.data); // הדפסת תוצאות מחיקת הפלייליסט
            fetchPlaylists(); // עדכון הפלייליסטים
        } catch (error) {
            console.error('Error deleting playlist:', error);
        }
    };

    // הדפסת התוכן של הפלייליסטים
    return (
        <div className="playlist-container">
            <h3>Your Playlists</h3>
            <div className="create-playlist">
                <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="Enter playlist name"
                />
                <button onClick={handleCreatePlaylist}>Create Playlist</button>
            </div>

            <div className="playlist-list">
                {playlists.length > 0 ? (
                    playlists.map((playlist) => (
                        <div key={playlist.id} className="playlist-item">
                            <h4>{playlist.name}</h4>
                            <button onClick={() => handleDeletePlaylist(playlist.name)}>Delete</button>
                        </div>
                    ))
                ) : (
                    <p>No playlists found.</p>
                )}
            </div>

            <div className="add-song">
                <h4>Add Song to Playlist</h4>
                <select onChange={(e) => setSelectedPlaylist(e.target.value)} value={selectedPlaylist}>
                    <option value="">Select Playlist</option>
                    {playlists.map((playlist) => (
                        <option key={playlist.id} value={playlist.name}>
                            {playlist.name}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    value={songName}
                    onChange={(e) => setSongName(e.target.value)}
                    placeholder="Song Name"
                />
                <input
                    type="text"
                    value={songLink}
                    onChange={(e) => setSongLink(e.target.value)}
                    placeholder="Song Link"
                />
                <button onClick={handleAddSong}>Add Song</button>
            </div>
        </div>
    );
}

export default Playlist;