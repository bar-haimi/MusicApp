import React from 'react';
import './App.css';
import Search from './search';
import Registration from './Registration';

function App() {
    return (
        <div>
            <h1>Spotify Song Search</h1>
            <div className="container">
                <Search />
                <Registration />
            </div>
        </div>
    );
}

export default App;

