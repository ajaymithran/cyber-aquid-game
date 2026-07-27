import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

// Live player updates from Firestore


const SQUID_SVG = (
  <svg viewBox="0 0 40 40" width="22" height="22" fill="none">
    <ellipse cx="20" cy="18" rx="10" ry="12" fill="#ff2d6b" opacity="0.9"/>
    <circle cx="16" cy="15" r="2.5" fill="#0a0a14"/>
    <circle cx="24" cy="15" r="2.5" fill="#0a0a14"/>
    <path d="M10 28 Q8 35 6 38" stroke="#ff2d6b" strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 30 Q12 36 11 40" stroke="#ff2d6b" strokeWidth="2" strokeLinecap="round"/>
    <path d="M20 30 Q20 37 20 40" stroke="#ff2d6b" strokeWidth="2" strokeLinecap="round"/>
    <path d="M26 30 Q28 36 29 40" stroke="#ff2d6b" strokeWidth="2" strokeLinecap="round"/>
    <path d="M30 28 Q32 35 34 38" stroke="#ff2d6b" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="20" cy="10" rx="5" ry="4" fill="#ff2d6b" opacity="0.7"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="2" y1="2" x2="14" y2="14"/>
    <line x1="14" y1="2" x2="2" y2="14"/>
  </svg>
);

const SkullIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
    <path d="M8 1a5 5 0 0 0-5 5c0 1.8.9 3.3 2.3 4.2V12h5.4v-1.8A5 5 0 0 0 8 1zM6 10.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
    <rect x="5.5" y="12.5" width="5" height="1.5" rx="0.5"/>
  </svg>
);

function PlayerCard({ player, onKick, onEliminate, selected, onSelect }) {
  const isEliminated = player.status === "eliminated";
  const cardRef = useRef(null);

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(player.id)}
      style={{
        position: "relative",
        background: isEliminated
          ? "linear-gradient(135deg, #1a0a0a 0%, #0d0d1a 100%)"
          : selected
          ? "linear-gradient(135deg, #0d1a2e 0%, #0d0d1a 100%)"
          : "linear-gradient(135deg, #0d0d1a 0%, #111126 100%)",
        border: isEliminated
          ? "1px solid #6b0000"
          : selected
          ? "1px solid #ff2d6b"
          : "1px solid #1e1e3a",
        borderRadius: "12px",
        padding: "16px 12px",
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: selected
          ? "0 0 20px rgba(255, 45, 107, 0.3), inset 0 0 20px rgba(255, 45, 107, 0.04)"
          : isEliminated
          ? "0 0 12px rgba(150, 0, 0, 0.25)"
          : "0 0 8px rgba(0, 0, 0, 0.5)",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Scan line effect */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)",
        borderRadius: "12px", zIndex: 1,
      }}/>

      {/* Eliminated overlay */}
      {isEliminated && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 3,
          background: "rgba(120, 0, 0, 0.38)",
          borderRadius: "12px",
          backdropFilter: "blur(1.5px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            border: "2px solid #cc0000",
            color: "#ff3333",
            fontSize: "10px",
            fontWeight: "700",
            letterSpacing: "3px",
            padding: "3px 8px",
            fontFamily: "'Courier New', monospace",
            textShadow: "0 0 10px #ff0000",
            transform: "rotate(-8deg)",
          }}>
            ELIMINATED
          </div>
        </div>
      )}

      {/* Avatar circle */}
      <div style={{
        width: "52px", height: "52px", borderRadius: "50%",
        background: isEliminated
          ? "radial-gradient(circle, #2a0000 40%, #1a0000 100%)"
          : "radial-gradient(circle, #0f0f2e 40%, #0a0a1a 100%)",
        border: isEliminated ? "2px solid #440000" : "2px solid #2a2a5a",
        margin: "0 auto 10px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "15px", fontWeight: "700",
        fontFamily: "'Courier New', monospace",
        color: isEliminated ? "#663333" : "#ff2d6b",
        position: "relative", zIndex: 2,
        filter: isEliminated ? "grayscale(0.6)" : "none",
        transition: "all 0.3s ease",
        textShadow: isEliminated ? "none" : "0 0 8px rgba(255, 45, 107, 0.5)",
      }}>
        {player.avatar}
      </div>

      {/* Player name */}
      <div style={{
        fontSize: "11px", fontWeight: "600", textAlign: "center",
        color: isEliminated ? "#553333" : "#c0c8ff",
        fontFamily: "'Courier New', monospace",
        letterSpacing: "0.5px",
        marginBottom: "6px",
        position: "relative", zIndex: 2,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        filter: isEliminated ? "blur(0.3px)" : "none",
      }}>
        {player.name}
      </div>

      {/* Round badge */}
      <div style={{
        textAlign: "center", marginBottom: "8px", position: "relative", zIndex: 2,
      }}>
        <span style={{
          fontSize: "10px", fontFamily: "'Courier New', monospace",
          color: isEliminated ? "#442222" : "#5566aa",
          letterSpacing: "1px",
        }}>
          ROUND {player.round}
        </span>
      </div>

      {/* Status pill */}
      <div style={{
        textAlign: "center", position: "relative", zIndex: 2,
      }}>
        <span style={{
          display: "inline-block",
          fontSize: "9px", fontWeight: "700",
          letterSpacing: "2px",
          padding: "2px 8px",
          borderRadius: "20px",
          fontFamily: "'Courier New', monospace",
          background: isEliminated ? "rgba(100,0,0,0.4)" : "rgba(0,80,40,0.4)",
          color: isEliminated ? "#ff4444" : "#00ff88",
          border: isEliminated ? "1px solid #660000" : "1px solid #006633",
          textShadow: isEliminated ? "0 0 6px #ff0000" : "0 0 6px #00ff88",
        }}>
          {isEliminated ? "ELIMINATED" : "ALIVE"}
        </span>
      </div>

      {/* Selection glow bar */}
      {selected && !isEliminated && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "2px", background: "linear-gradient(90deg, transparent, #ff2d6b, transparent)",
          zIndex: 4,
        }}/>
      )}
    </div>
  );
}

export default function HostDashboard() {
  const [players, setPlayers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [log, setLog] = useState(["[HOST SYSTEM ONLINE]", "[MONITORING ACTIVE — ALL CHANNELS LIVE]"]);
  const [glitch, setGlitch] = useState(false);
  const logRef = useRef(null);

  const totalPlayers = players.length;
  const alivePlayers = players.filter(p => p.status === "alive").length;
  const eliminatedPlayers = players.filter(p => p.status === "eliminated").length;
  const selectedPlayer = players.find(p => p.id === selectedId);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  useEffect(() => {
    const playersRef = collection(db, "players");

    const unsubscribe = onSnapshot(playersRef, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(playersData);
    }, (error) => {
      console.error("HostDashboard: Firestore listener error", error);
      setPlayers([]);
    });

    return () => unsubscribe();
  }, []);

  const addLog = (msg) => {
    const ts = new Date().toLocaleTimeString("en-GB", { hour12: false });
    setLog(prev => [...prev.slice(-30), `[${ts}] ${msg}`]);
  };

  const triggerGlitch = () => {
    setGlitch(true);
    setTimeout(() => setGlitch(false), 300);
  };

  const handleEliminate = async () => {
    if (!selectedId) return;
    const target = players.find(p => p.id === selectedId);
    if (!target || target.status === "eliminated") return;

    triggerGlitch();
    setPlayers(prev => prev.map(p => p.id === selectedId ? { ...p, status: "eliminated" } : p));
    addLog(`⚠ ELIMINATED — ${target.name}`);
    setSelectedId(null);

    try {
      const playerDoc = doc(db, "players", String(selectedId));
      await updateDoc(playerDoc, { status: "eliminated", lastUpdated: new Date() });
    } catch (err) {
      console.warn("Firestore eliminate update failed", err);
    }
  };

  const handleKick = async () => {
    if (!selectedId) return;
    const target = players.find(p => p.id === selectedId);
    if (!target) return;
    triggerGlitch();
    setPlayers(prev => prev.filter(p => p.id !== selectedId));
    addLog(`✖ KICKED — ${target.name} removed from session`);
    setSelectedId(null);

    try {
      const playerDoc = doc(db, "players", String(selectedId));
      await deleteDoc(playerDoc);
    } catch (err) {
      console.warn("Firestore delete player failed", err);
    }
  };

  const handleRevive = async () => {
    if (!selectedId) return;
    const target = players.find(p => p.id === selectedId);
    if (!target || target.status === "alive") return;
    setPlayers(prev => prev.map(p => p.id === selectedId ? { ...p, status: "alive" } : p));
    addLog(`↺ REVIVED — ${target.name} re-entered the game`);
    setSelectedId(null);

    try {
      const playerDoc = doc(db, "players", String(selectedId));
      await updateDoc(playerDoc, { status: "alive", lastUpdated: new Date() });
    } catch (err) {
      console.warn("Firestore revive update failed", err);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#06060f",
      color: "#c0c8ff",
      fontFamily: "'Courier New', monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Animated grid background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(255, 45, 107, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 45, 107, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}/>

      {/* Vignette */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 40%, #06060f 100%)",
      }}/>

      {/* Glitch overlay */}
      {glitch && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none",
          background: "rgba(255,0,50,0.12)",
          animation: "none",
        }}/>
      )}

      <div style={{ position: "relative", zIndex: 1, padding: "20px 24px", maxWidth: "1300px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid #1e1e3a",
          paddingBottom: "16px", marginBottom: "24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {SQUID_SVG}
            <div>
              <div style={{
                fontSize: "20px", fontWeight: "700", letterSpacing: "4px",
                color: "#ff2d6b",
                textShadow: "0 0 20px rgba(255,45,107,0.6)",
              }}>
                CYBER SQUID CONTROL
              </div>
              <div style={{ fontSize: "10px", color: "#3a3a6a", letterSpacing: "3px", marginTop: "2px" }}>
                HOST MONITORING SYSTEM — CLASSIFIED
              </div>
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            fontSize: "11px", color: "#00ff88",
            textShadow: "0 0 8px rgba(0,255,136,0.5)",
          }}>
            <div style={{
              width: "7px", height: "7px", borderRadius: "50%",
              background: "#00ff88",
              boxShadow: "0 0 8px #00ff88",
              animation: "pulse 2s infinite",
            }}/>
            LIVE
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          marginBottom: "24px",
        }}>
          {[
            { label: "TOTAL PLAYERS", value: totalPlayers, color: "#7788ff", glow: "#4455ff" },
            { label: "ALIVE", value: alivePlayers, color: "#00ff88", glow: "#00cc66" },
            { label: "ELIMINATED", value: eliminatedPlayers, color: "#ff2d6b", glow: "#cc0033" },
          ].map(({ label, value, color, glow }) => (
            <div key={label} style={{
              background: "linear-gradient(135deg, #0d0d1a 0%, #0a0a14 100%)",
              border: `1px solid ${color}22`,
              borderRadius: "10px",
              padding: "18px 20px",
              textAlign: "center",
              boxShadow: `0 0 16px ${color}11`,
            }}>
              <div style={{
                fontSize: "36px", fontWeight: "700", color,
                textShadow: `0 0 20px ${glow}`,
                lineHeight: 1.1,
              }}>
                {value}
              </div>
              <div style={{
                fontSize: "10px", color: "#3a3a6a", letterSpacing: "2.5px", marginTop: "4px",
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Main grid + sidebar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "20px", alignItems: "start" }}>

          {/* Player Grid */}
          <div>
            <div style={{
              fontSize: "10px", color: "#3a3a6a", letterSpacing: "3px",
              marginBottom: "14px",
            }}>
              ◈ SELECT PLAYER TO MANAGE
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "12px",
            }}>
              {players.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  selected={selectedId === player.id}
                  onSelect={setSelectedId}
                  onKick={handleKick}
                  onEliminate={handleEliminate}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Host Controls */}
            <div style={{
              background: "linear-gradient(135deg, #0d0d1a 0%, #0a0a14 100%)",
              border: "1px solid #1e1e3a",
              borderRadius: "12px",
              padding: "18px",
            }}>
              <div style={{
                fontSize: "10px", color: "#3a3a6a", letterSpacing: "3px", marginBottom: "14px",
              }}>
                ◈ HOST CONTROLS
              </div>

              {selectedPlayer ? (
                <div style={{
                  background: "rgba(255,45,107,0.06)",
                  border: "1px solid #ff2d6b33",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "14px",
                }}>
                  <div style={{ fontSize: "9px", color: "#5566aa", letterSpacing: "2px", marginBottom: "4px" }}>
                    SELECTED
                  </div>
                  <div style={{ fontSize: "13px", color: "#ff2d6b", fontWeight: "700" }}>
                    {selectedPlayer.name}
                  </div>
                  <div style={{ fontSize: "10px", color: "#4a4a7a", marginTop: "2px" }}>
                    Round {selectedPlayer.round} · {selectedPlayer.status.toUpperCase()}
                  </div>
                </div>
              ) : (
                <div style={{
                  background: "rgba(30,30,60,0.4)",
                  border: "1px dashed #1e1e3a",
                  borderRadius: "8px", padding: "12px", marginBottom: "14px",
                  textAlign: "center", fontSize: "11px", color: "#2a2a5a",
                }}>
                  Click a player to select
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  onClick={handleEliminate}
                  disabled={!selectedPlayer || selectedPlayer.status === "eliminated"}
                  style={{
                    width: "100%", padding: "10px 12px",
                    background: selectedPlayer && selectedPlayer.status !== "eliminated"
                      ? "linear-gradient(135deg, #4a0015 0%, #2a000a 100%)"
                      : "rgba(30,30,50,0.4)",
                    border: selectedPlayer && selectedPlayer.status !== "eliminated"
                      ? "1px solid #cc0033"
                      : "1px solid #1a1a3a",
                    borderRadius: "8px",
                    color: selectedPlayer && selectedPlayer.status !== "eliminated" ? "#ff2d6b" : "#2a2a5a",
                    fontSize: "11px", fontWeight: "700", letterSpacing: "2px",
                    cursor: selectedPlayer && selectedPlayer.status !== "eliminated" ? "pointer" : "not-allowed",
                    fontFamily: "'Courier New', monospace",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    transition: "all 0.2s ease",
                    textShadow: selectedPlayer && selectedPlayer.status !== "eliminated"
                      ? "0 0 8px rgba(255,45,107,0.5)" : "none",
                    boxShadow: selectedPlayer && selectedPlayer.status !== "eliminated"
                      ? "0 0 12px rgba(255,0,50,0.2)" : "none",
                  }}
                >
                  <SkullIcon/> ELIMINATE PLAYER
                </button>

                <button
                  onClick={handleKick}
                  disabled={!selectedPlayer}
                  style={{
                    width: "100%", padding: "10px 12px",
                    background: selectedPlayer
                      ? "linear-gradient(135deg, #1a1a00 0%, #0d0d00 100%)"
                      : "rgba(30,30,50,0.4)",
                    border: selectedPlayer ? "1px solid #665500" : "1px solid #1a1a3a",
                    borderRadius: "8px",
                    color: selectedPlayer ? "#ffaa00" : "#2a2a5a",
                    fontSize: "11px", fontWeight: "700", letterSpacing: "2px",
                    cursor: selectedPlayer ? "pointer" : "not-allowed",
                    fontFamily: "'Courier New', monospace",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    transition: "all 0.2s ease",
                    textShadow: selectedPlayer ? "0 0 8px rgba(255,170,0,0.4)" : "none",
                  }}
                >
                  <XIcon/> KICK PLAYER
                </button>

                <button
                  onClick={handleRevive}
                  disabled={!selectedPlayer || selectedPlayer.status === "alive"}
                  style={{
                    width: "100%", padding: "10px 12px",
                    background: selectedPlayer && selectedPlayer.status === "eliminated"
                      ? "linear-gradient(135deg, #001a0d 0%, #000d07 100%)"
                      : "rgba(30,30,50,0.4)",
                    border: selectedPlayer && selectedPlayer.status === "eliminated"
                      ? "1px solid #006633" : "1px solid #1a1a3a",
                    borderRadius: "8px",
                    color: selectedPlayer && selectedPlayer.status === "eliminated" ? "#00ff88" : "#2a2a5a",
                    fontSize: "11px", fontWeight: "700", letterSpacing: "2px",
                    cursor: selectedPlayer && selectedPlayer.status === "eliminated" ? "pointer" : "not-allowed",
                    fontFamily: "'Courier New', monospace",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    transition: "all 0.2s ease",
                    textShadow: selectedPlayer && selectedPlayer.status === "eliminated"
                      ? "0 0 8px rgba(0,255,136,0.4)" : "none",
                  }}
                >
                  ↺ REVIVE PLAYER
                </button>
              </div>
            </div>

            {/* Activity Log */}
            <div style={{
              background: "linear-gradient(135deg, #0d0d1a 0%, #0a0a14 100%)",
              border: "1px solid #1e1e3a",
              borderRadius: "12px",
              padding: "16px",
            }}>
              <div style={{
                fontSize: "10px", color: "#3a3a6a", letterSpacing: "3px", marginBottom: "12px",
              }}>
                ◈ ACTIVITY LOG
              </div>
              <div
                ref={logRef}
                style={{
                  height: "180px", overflowY: "auto",
                  display: "flex", flexDirection: "column", gap: "4px",
                  scrollbarWidth: "none",
                }}
              >
                {log.map((entry, i) => (
                  <div key={i} style={{
                    fontSize: "10px",
                    color: entry.includes("ELIMINATED")
                      ? "#ff2d6b"
                      : entry.includes("KICKED")
                      ? "#ffaa00"
                      : entry.includes("REVIVED")
                      ? "#00ff88"
                      : entry.includes("ONLINE") || entry.includes("MONITORING")
                      ? "#5566aa"
                      : "#3a3a6a",
                    lineHeight: 1.6,
                    fontFamily: "'Courier New', monospace",
                    textShadow: entry.includes("ELIMINATED") ? "0 0 6px rgba(255,45,107,0.4)" : "none",
                  }}>
                    {entry}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
