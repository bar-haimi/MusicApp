import React, { useState } from 'react';
import axios from 'axios';
import './Search.css';

function Search() {
    const [query, setQuery] = useState('');
    const [songs, setSongs] = useState([]);

    const searchSongs = async () => {
        try {
            // Fetch Spotify token
            const tokenResponse = await axios.get('http://localhost:5000/api/token');
            const accessToken = tokenResponse.data.access_token;

            // Detect language of the query
            const queryLanguage = detectLanguage(query);

            // Search for songs on Spotify
            const searchResponse = await axios.get(
                `https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const tracks = searchResponse.data.tracks.items;

            // Filter results by language
            const filteredTracks = tracks.filter((track) =>
                isSameLanguage(track.name, queryLanguage)
            );

            // Fetch lyrics for each song
            const tracksWithLyrics = await Promise.all(
                filteredTracks.map(async (track) => {
                    const songName = track.name;
                    const artistName = track.artists[0].name;

                    try {
                        const lyricsResponse = await axios.get('http://localhost:5000/api/lyrics', {
                            params: {
                                song: songName,
                                artist: artistName,
                            },
                        });
                        return { ...track, lyricsUrl: lyricsResponse.data.lyricsUrl };
                    } catch (error) {
                        console.error(`Error fetching lyrics for ${songName}:`, error.message);
                        return { ...track, lyricsUrl: null };
                    }
                })
            );

            setSongs(tracksWithLyrics);
        } catch (error) {
            console.error('Error searching Spotify:', error.message);
        }
    };

    const detectLanguage = (text) => {
        // Normalize the text by removing special characters
        const normalizedText = text.replace(/[^\p{L}\p{N}\s]/gu, '');

        // Language detection using regex
        const englishRegex = /^[A-Za-z0-9\s]+$/;
        if (englishRegex.test(normalizedText)) {
            return 'english';
        }

        const hebrewRegex = /[\u0590-\u05FF]/;
        if (hebrewRegex.test(normalizedText)) {
            return 'hebrew';
        }

        return 'unknown'; // Default if language cannot be determined
    };

    const isSameLanguage = (trackName, queryLanguage) => {
        // Detect the language of the track name
        const trackLanguage = detectLanguage(trackName);

        // Return true if the track language matches the query language
        return trackLanguage === queryLanguage || queryLanguage === 'unknown';
    };

    return (
        <div className="search-container">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search for a song..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button onClick={searchSongs}>Search</button>
            </div>
            <div className="results-container">
                {songs.map((song) => (
                    <div className="song-card" key={song.id}>
                        <h3>{song.name}</h3>
                        <p><strong>Artists:</strong> {song.artists.map((artist) => artist.name).join(', ')}</p>
                        <p><strong>Album:</strong> {song.album.name}</p>
                        <img
                            src={song.album.images[0]?.url || 'https://via.placeholder.com/150'}
                            alt="Album Art"
                            className="album-art"
                        />
                        <p><strong>Spotify Link:</strong> <a href={song.external_urls.spotify} target="_blank" rel="noopener noreferrer">Open on Spotify</a></p>
                        <p><strong>Lyrics:</strong>{' '}
                            {song.lyricsUrl ? (
                                <a href={song.lyricsUrl} target="_blank" rel="noopener noreferrer">View Lyrics</a>
                            ) : (
                                'Lyrics not available'
                            )}
                        </p>
                        <p><strong>Preview:</strong>{' '}
                            {song.preview_url ? (
                                <audio controls>
                                    <source src={song.preview_url} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            ) : (
                                'No preview available'
                            )}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Search;
