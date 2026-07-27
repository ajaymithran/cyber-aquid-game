import React, { useState } from 'react';
import CyberSquidGame from './cyber-squid-game-full'; // Make sure the filename matches exactly
import HostDashboard from './HostDashboard';         // Make sure the filename matches exactly

function App() {
  // 'view' can be 'start', 'game', or 'host'
  const [view, setView] = useState('start');

  return (
    <div className="App">
      {/* 1. START SCREEN */}
      {view === 'start' && (
        <div style={{
          height: '100vh', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', background: '#050505'
        }}>
          <h1 style={{ color: '#ff2d6b', marginBottom: '2rem', fontFamily: 'Black Han Sans' }}>
            CYBER SQUID
          </h1>
          <button 
            onClick={() => setView('game')}
            style={{ padding: '15px 40px', margin: '10px', background: '#ff2d6b', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            JOIN AS PLAYER
          </button>
          <button 
            onClick={() => setView('host')}
            style={{ padding: '10px 20px', margin: '10px', background: 'transparent', color: '#555', border: '1px solid #333', cursor: 'pointer' }}
          >
            OPEN HOST PANEL
          </button>
        </div>
      )}

      {/* 2. PLAYER GAME VIEW */}
      {view === 'game' && <CyberSquidGame />}

      {/* 3. HOST DASHBOARD VIEW */}
      {view === 'host' && <HostDashboard />}
    </div>
  );
}

export default App;