const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { signIn, usernameExists, login, getUserHistory, getPlaylist, createPlaylist, getUserId, deletePlaylist, addSongToPlaylist, removeSongToPlaylist } = require('./src/index.ts');

dotenv.config();
const SECRET_KEY = 'Ben_Gurion_University_of_the_Negev';
const app = express();
app.use(express.json());
app.use(cors());
const PORT = 5000;

// Spotify Token Endpoint
app.get('/api/token', async (req, res) => {
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', null, {
            headers: {
                Authorization: `Basic ${Buffer.from(
                    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                ).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            params: {
                grant_type: 'client_credentials',
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching Spotify token:', error.message);
        res.status(500).send('Error fetching Spotify token');
    }
});

// Genius Lyrics Endpoint
app.get('/api/lyrics', async (req, res) => {
    const { song, artist } = req.query;

    try {
        const response = await axios.get('https://api.genius.com/search', {
            headers: {
                Authorization: `Bearer ${process.env.GENIUS_API_KEY}`,
            },
            params: {
                q: `${song} ${artist}`,
            },
        });

        const hits = response.data.response.hits;

        // Filter for the best match
        const match = hits.find(
            (hit) =>
                hit.result.title.toLowerCase().includes(song.toLowerCase()) &&
                hit.result.primary_artist.name.toLowerCase().includes(artist.toLowerCase())
        );

        if (match) {
            const lyricsUrl = match.result.url;
            res.json({ lyricsUrl });
        } else {
            res.status(404).send('Lyrics not found');
        }
    } catch (error) {
        console.error('Error fetching lyrics:', error.message);
        res.status(500).send('Error fetching lyrics');
    }
});

//Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const isExists = usernameExists(username);
    if (!username || username == '' )
        res.status(400).send('Username is required');
    else if (!password || password == '')
        res.status(400).send('Password is required');
    else{
        if (isExists) {
            const isValidCradentials = await login(username, password)
            console.log(`isValid: ${isValidCradentials}`);
            if (isValidCradentials){
                console.log('valid');
                const userId = getUserId(username);
                const token = jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '1h' });
                res.status(200).json({ token });
            } else {
                console.log('not valid');
                res.status(401).send('Username or password is incorrect');
            }
        } else {
            res.status(404).send('Username does not exist');
        }
    }
  });

//Register Endpoint  
app.post('/register',async (req, res) => {
    const { username, password } = req.body;
    console.log('password: ', password)
    if (!username || username == '' )
        res.status(400).send('Username is required');
    else if (!password || password == '')
        res.status(400).send('Password is required');
    else{
        const isAlreadyExists = await usernameExists(username);
        if (isAlreadyExists)
            res.status(409).send('Username already exists');
        else{           
            try{
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                signIn(username  , hashedPassword);
                res.status(201).send('successfully registered');
            } catch (err) {
                console.error('Error hashing password:', err);
                res.status(500).send('Error hashing password' );
            }
        }
    }
        
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
