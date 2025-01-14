import React, { useState } from 'react';
import './Registration.css';
import axios from 'axios';

function Registration() {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async () => {
        if (isLoginMode) {
            try {
                const response = await axios.post('http://localhost:5000/login', {
                        username: username,
                        password: password,
                    }, 
                  );
                localStorage.setItem('token', response.data.token);
                alert(`${username} logged in successfully`);
              } catch (error) {
                alert('Error occurred: ' + error.response.data);
              }
        } else {
            try{
                await axios.post('http://localhost:5000/register', {
                        username: username,
                        password: password,
                    }, 
                  );
                alert('Registered successfully');
            } catch (error){
                alert('Error trying to register' + error.response.data);
            }
        }
        setUsername('');
        setPassword('');
    };

    return (
        <div className="auth-container">
            <h3>{isLoginMode ? 'Login' : 'Register'}</h3>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleSubmit}>
                {isLoginMode ? 'Login' : 'Register'}
            </button>
            <p onClick={() => setIsLoginMode(!isLoginMode)}>
                {isLoginMode ? "Don't have an account? Register" : 'Already have an account? Login'}
            </p>
        </div>
    );
}

export default Registration;
