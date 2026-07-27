import { db } from "./firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";

import { useState, useEffect, useRef } from "react";


/* ═══════════════════════════════════════════════════════
   FONTS & GLOBAL STYLES
═══════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Share+Tech+Mono&family=Noto+Serif+KR:wght@400;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body,#root{background:#050505;color:#fff;min-height:100vh;font-family:'Share Tech Mono',monospace;}
    input::placeholder{color:#333;}
    input:focus{outline:none;}
    button:focus{outline:none;}
    ::-webkit-scrollbar{width:4px;}
    ::-webkit-scrollbar-track{background:#0a0a0a;}
    ::-webkit-scrollbar-thumb{background:#ff2d6d44;}

    body::after{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px);pointer-events:none;z-index:9999;}

    @keyframes floatUp{0%{transform:translateY(0) rotate(0deg);opacity:0;}10%{opacity:.7;}90%{opacity:.2;}100%{transform:translateY(-110vh) rotate(360deg);opacity:0;}}
    @keyframes pulse{0%{opacity:1;}100%{opacity:.4;}}
    @keyframes fadeInUp{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);}}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes shake{0%,100%{transform:translateX(0);}20%{transform:translateX(-8px);}40%{transform:translateX(8px);}60%{transform:translateX(-5px);}80%{transform:translateX(5px);}}
    @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes scanline{0%{top:-10%;}100%{top:110%;}}
    @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(255,45,109,.4);}50%{box-shadow:0 0 50px rgba(255,45,109,.9),0 0 80px rgba(255,45,109,.3);}}
    @keyframes tugLeft{0%,100%{transform:translateX(0);}50%{transform:translateX(-12px);}}
    @keyframes tugRight{0%,100%{transform:translateX(0);}50%{transform:translateX(12px);}}
    @keyframes ropeWave{0%,100%{scaleY:1);}50%{transform:scaleY(1.04);}}
    @keyframes countDown{from{stroke-dashoffset:0;}to{stroke-dashoffset:283;}}
    @keyframes explosion{0%{transform:scale(0);opacity:1;}100%{transform:scale(3);opacity:0;}}
    @keyframes slideInLeft{from{opacity:0;transform:translateX(-40px);}to{opacity:1;transform:translateX(0);}}
    @keyframes slideInRight{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}
    @keyframes honeyReveal{from{opacity:0;transform:scale(.6) rotate(-10deg);}to{opacity:1;transform:scale(1) rotate(0deg);}}
    @keyframes bossShake{0%,100%{transform:translateX(0) rotate(0deg);}25%{transform:translateX(-4px) rotate(-1deg);}75%{transform:translateX(4px) rotate(1deg);}}
    @keyframes typewriter{from{width:0;}to{width:100%;}}
    @keyframes healthPulse{0%,100%{opacity:1;}50%{opacity:.6;}}
  `}</style>
);

/* ═══════════════════════════════════════════════════════
   SHARED COMPONENTS
═══════════════════════════════════════════════════════ */
const FloatingShapes = () => (
  <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
    {Array.from({length:14},(_,i)=>(
      <div key={i} style={{position:"absolute",left:`${(i*7.3)%100}%`,bottom:"-10%",fontSize:`${1.2+(i%3)*.6}rem`,color:"#ff2d6d",opacity:0.04+(i%4)*.01,animation:`floatUp ${7+(i%4)}s ${i*.6}s infinite linear`}}>
        {["▲","○","■"][i%3]}
      </div>
    ))}
  </div>
);

const inputS = {width:"100%",padding:".75rem 1rem",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,45,109,.25)",borderRadius:"2px",color:"#fff",fontFamily:"'Share Tech Mono',monospace",fontSize:".88rem",outline:"none",marginBottom:0,boxSizing:"border-box",transition:"border-color .2s"};
const labelS = {display:"block",fontFamily:"'Share Tech Mono',monospace",fontSize:".68rem",color:"#666",letterSpacing:".2em",marginBottom:".5rem"};

/* ═══════════════════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════════════════ */
function LoginPage({onLogin}){
  const [teamId,setTeamId]=useState("");
  const [teamName,setTeamName]=useState("");
  const [players,setPlayers]=useState(["","",""]);
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const submit = async () => {
  if(!teamId.trim() || !teamName.trim() || players.every(p => !p.trim())){
    setErr("ALL FIELDS MANDATORY");
    return;
  }

  setErr("");
  setLoading(true);

  const playerId = Date.now().toString(); // unique id

  await setDoc(doc(db, "players", playerId), {
    teamId: teamId,
    teamName: teamName,
    players: players.filter(p => p.trim()),
    round: 1,
    status: "alive"
  });
  localStorage.setItem("playerId", playerId);

  setTimeout(() => {
    setLoading(false);
    onLogin({
      teamId,
      teamName,
      players: players.filter(p => p.trim()),
      playerId
    });
  }, 2200);
};

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem",position:"relative",zIndex:1}}>
      <div style={{width:"100%",maxWidth:"460px",animation:"fadeInUp .8s ease both"}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{display:"flex",justifyContent:"center",gap:"1.2rem",marginBottom:"1rem"}}>
            {["▲","○","■"].map((s,i)=><span key={i} style={{fontSize:"2.2rem",color:i%2===0?"#ff2d6d":"#fff",animation:`pulse ${1+i*.3}s ease-in-out infinite alternate`,filter:i%2===0?"drop-shadow(0 0 10px #ff2d6d)":"none"}}>{s}</span>)}
          </div>
          <h1 style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"clamp(2.2rem,6vw,3.2rem)",color:"#ff2d6d",letterSpacing:".05em",textShadow:"0 0 40px rgba(255,45,109,.6)"}}>CYBER</h1>
          <h1 style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"clamp(2.2rem,6vw,3.2rem)",color:"#fff",letterSpacing:".05em",marginTop:"-.4rem"}}>SQUID GAME</h1>
          <p style={{fontFamily:"'Share Tech Mono',monospace",color:"#555",fontSize:".72rem",letterSpacing:".3em",marginTop:".5rem"}}>CTF CHALLENGE — ENTER TO SURVIVE</p>
        </div>

        <div style={{background:"rgba(8,8,8,.95)",border:"1px solid rgba(255,45,109,.25)",borderRadius:"4px",padding:"2.5rem",boxShadow:"0 0 60px rgba(255,45,109,.07)"}}>
          {[["▲ TEAM ID",teamId,setTeamId,"e.g. 456"],["○ TEAM NAME",teamName,setTeamName,"e.g. Red Light"]].map(([lbl,val,set,ph],i)=>(
            <div key={i} style={{marginBottom:"1.2rem"}}>
              <label style={labelS}>{lbl}</label>
              <input value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={inputS} onFocus={e=>e.target.style.borderColor="#ff2d6d"} onBlur={e=>e.target.style.borderColor="rgba(255,45,109,.25)"}/>
            </div>
          ))}
          <div style={{marginBottom:"1.5rem"}}>
            <label style={{...labelS,display:"flex",justifyContent:"space-between"}}>
              <span>■ PLAYERS</span>
              {players.length<6&&<button onClick={()=>setPlayers([...players,""])} style={{background:"none",border:"1px solid rgba(255,45,109,.4)",color:"#ff2d6d",fontSize:".6rem",padding:"2px 8px",cursor:"pointer",letterSpacing:".1em"}}>+ ADD</button>}
            </label>
            {players.map((p,i)=>(
              <div key={i} style={{display:"flex",gap:".5rem",alignItems:"center",marginBottom:".5rem"}}>
                <span style={{fontFamily:"'Share Tech Mono',monospace",color:"#333",fontSize:".65rem",minWidth:"1.8rem"}}>#{String(i+1).padStart(2,"0")}</span>
                <input value={p} onChange={e=>{const a=[...players];a[i]=e.target.value;setPlayers(a);}} placeholder={`Player ${i+1}`} style={{...inputS,flex:1}} onFocus={e=>e.target.style.borderColor="#ff2d6d"} onBlur={e=>e.target.style.borderColor="rgba(255,45,109,.25)"}/>
                {players.length>1&&<button onClick={()=>setPlayers(players.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:"1.1rem"}}>×</button>}
              </div>
            ))}
          </div>
          {err&&<div style={{marginBottom:"1rem",padding:".6rem 1rem",border:"1px solid rgba(255,45,109,.5)",background:"rgba(255,45,109,.07)",fontSize:".7rem",color:"#ff2d6d",letterSpacing:".05em"}}>⚠ {err}</div>}
          <button onClick={submit} disabled={loading} style={{width:"100%",padding:"1rem",background:loading?"rgba(255,45,109,.15)":"#ff2d6d",border:"none",color:loading?"#ff2d6d":"#000",fontFamily:"'Black Han Sans',sans-serif",fontSize:"1rem",letterSpacing:".2em",cursor:loading?"not-allowed":"pointer",borderRadius:"2px",transition:"all .2s",boxShadow:loading?"none":"0 0 30px rgba(255,45,109,.4)"}}>
            {loading?"VERIFYING IDENTITY...":"ENTER THE GAME"}
          </button>
        </div>
        <p style={{textAlign:"center",fontFamily:"'Share Tech Mono',monospace",color:"#252525",fontSize:".62rem",marginTop:"1.5rem",letterSpacing:".15em"}}>ONCE YOU ENTER · THERE IS NO TURNING BACK</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROUND 1 — RED LIGHT GREEN LIGHT (MCQ IQ PATTERN)
═══════════════════════════════════════════════════════ */
const IQ_QUESTIONS = [
  {q:"What comes next in the sequence?\n2, 4, 8, 16, __",opts:["24","30","32","36"],ans:2,code:"# Pattern: multiply by 2\nseq = [2,4,8,16]\nnext_val = seq[-1] * 2\nprint(next_val)  # 32"},
  {q:"Find the missing number:\n1, 4, 9, 16, 25, __",opts:["30","36","42","49"],ans:1,code:"# Pattern: perfect squares\nimport math\nseq = [i**2 for i in range(1,7)]\nprint(seq[-1])  # 36"},
  {q:"Which shape completes the pattern?\n○ □ ○ □ ○ __",opts:["○","□","▲","◇"],ans:1,code:"# Pattern: alternating shapes\npattern = ['circle','square']\nidx = 5 % len(pattern)\nprint(pattern[idx])  # square"},
  {q:"What is the next number?\n3, 6, 11, 18, 27, __",opts:["36","38","40","42"],ans:1,code:"# Pattern: differences increase by 2\ndiffs=[3,5,7,9,11]\nseq=[3]\nfor d in diffs:\n  seq.append(seq[-1]+d)\nprint(seq[-1])  # 38"},
  {q:"Complete the matrix:\n1 2 3\n4 5 6\n7 8 __",opts:["9","10","11","12"],ans:0,code:"# Pattern: sequential 3x3 grid\nmatrix=[[1,2,3],[4,5,6],[7,8,'?']]\nval = 3*3  # row*col position\nprint(val)  # 9"},
  {q:"Next in sequence:\n▲ ▲▲ ▲▲▲ ▲▲▲▲ __",opts:["▲▲▲▲▲","▲▲▲","▲▲▲▲▲▲","▲▲"],ans:0,code:"# Pattern: count increases by 1\ndef next_shape(n):\n  return '▲' * (n+1)\nprint(next_shape(4))  # ▲▲▲▲▲"},
  {q:"What value replaces the '?'?\n5 → 25,  3 → 9,  7 → 49,  4 → ?",opts:["12","16","20","8"],ans:1,code:"# Pattern: n squared\ndef transform(n):\n  return n ** 2\nprint(transform(4))  # 16"},
  {q:"Find the odd one out:\n36, 49, 64, 81, 100, 110",opts:["36","81","100","110"],ans:3,code:"# Perfect squares check\nimport math\nnums=[36,49,64,81,100,110]\nodd=[n for n in nums if math.sqrt(n)!=int(math.sqrt(n))]\nprint(odd)  # [110]"},
  {q:"Next number in Fibonacci-like sequence:\n2, 3, 5, 8, 13, __",opts:["18","19","21","23"],ans:2,code:"# Fibonacci: add previous two\ndef fib_next(a,b):\n  return a + b\nprint(fib_next(8,13))  # 21"},
  {q:"Which completes the pattern?\nAC, CE, EG, GI, __",opts:["IJ","IK","JK","HI"],ans:1,code:"# Pattern: skip one letter each time\ndef next_pair(s):\n  a=ord(s[0])+2; b=ord(s[1])+2\n  return chr(a)+chr(b)\nprint(next_pair('GI'))  # IK"},
];

function Round1Game({onComplete}){
  const [phase,setPhase]=useState("loading"); // loading, playing, result
  const [qIdx,setQIdx]=useState(0);
  const [selected,setSelected]=useState(null);
  const [answers,setAnswers]=useState([]);
  const [light,setLight]=useState("green");
  const [showCode,setShowCode]=useState(false);
  const [loadPct,setLoadPct]=useState(0);

  useEffect(()=>{
    if(phase!=="loading") return;
    const iv=setInterval(()=>{
      setLoadPct(p=>{
        if(p>=100){clearInterval(iv);setTimeout(()=>setPhase("playing"),300);return 100;}
        return p+2.5;
      });
    },100);
    return()=>clearInterval(iv);
  },[phase]);

  useEffect(()=>{
    if(phase!=="playing") return;
    const iv=setInterval(()=>setLight(l=>l==="green"?"red":"green"),3000);
    return()=>clearInterval(iv);
  },[phase]);

  const choose=(i)=>{
    if(selected!==null) return;
    setSelected(i);
    setShowCode(true);
  };

  const next=()=>{
    const newAnswers=[...answers,{q:qIdx,sel:selected,correct:selected===IQ_QUESTIONS[qIdx].ans}];
    setAnswers(newAnswers);
    setSelected(null);setShowCode(false);
    if(qIdx+1>=IQ_QUESTIONS.length){setPhase("result");}
    else setQIdx(qIdx+1);
  };

  const score=answers.filter(a=>a.correct).length;
  const q=IQ_QUESTIONS[qIdx];

  if(phase==="loading") return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"5rem",marginBottom:"1.5rem",color:light==="green"?"#00ff88":"#ff2d6d",filter:`drop-shadow(0 0 30px ${light==="green"?"#00ff88":"#ff2d6d"})`,transition:"color .5s, filter .5s"}}>●</div>
        <h1 style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"2.5rem",color:"#ff2d6d",letterSpacing:".1em",marginBottom:".5rem"}}>RED LIGHT</h1>
        <h1 style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"2.5rem",color:"#00ff88",letterSpacing:".1em"}}>GREEN LIGHT</h1>
        <p style={{fontFamily:"'Share Tech Mono',monospace",color:"#555",marginTop:"1rem",fontSize:".75rem",letterSpacing:".2em"}}>ROUND 01 — PATTERN RECOGNITION</p>
        <div style={{marginTop:"2.5rem",width:"300px",height:"4px",background:"rgba(255,255,255,.05)",borderRadius:"2px",overflow:"hidden"}}>
          <div style={{height:"100%",background:"linear-gradient(90deg,#ff2d6d,#ff6b9d)",width:`${loadPct}%`,transition:"width .1s",boxShadow:"0 0 10px #ff2d6d"}}/>
        </div>
        <p style={{fontFamily:"'Share Tech Mono',monospace",color:"#555",fontSize:".65rem",marginTop:".75rem",letterSpacing:".2em"}}>INITIALIZING... {Math.round(loadPct)}%</p>
      </div>
    </div>
  );

  if(phase==="result") return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem",position:"relative",zIndex:1}}>
      <div style={{textAlign:"center",animation:"fadeInUp .6s ease both"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>▲</div>
        <h2 style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"2.5rem",color:score>=7?"#00ff88":"#ff2d6d",marginBottom:".5rem"}}>
          {score>=7?"ROUND CLEARED":"ELIMINATED"}
        </h2>
        <p style={{fontFamily:"'Share Tech Mono',monospace",color:"#888",fontSize:".8rem",letterSpacing:".2em",marginBottom:"2rem"}}>
          SCORE: {score} / {IQ_QUESTIONS.length} CORRECT
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:".4rem",marginBottom:"2rem",maxWidth:"320px",margin:"0 auto 2rem"}}>
          {answers.map((a,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:".4rem .75rem",background:a.correct?"rgba(0,255,136,.06)":"rgba(255,45,109,.06)",border:`1px solid ${a.correct?"rgba(0,255,136,.2)":"rgba(255,45,109,.2)"}`,fontSize:".65rem",letterSpacing:".05em"}}>
              <span style={{color:"#555"}}>Q{i+1}</span>
              <span style={{color:a.correct?"#00ff88":"#ff2d6d"}}>{a.correct?"✓ CORRECT":"✗ WRONG"}</span>
            </div>
          ))}
        </div>
        <button onClick={()=>onComplete(score)} style={{padding:"1rem 3rem",background:"#ff2d6d",border:"none",color:"#000",fontFamily:"'Black Han Sans',sans-serif",fontSize:"1rem",letterSpacing:".2em",cursor:"pointer",boxShadow:"0 0 30px rgba(255,45,109,.4)"}}>
          PROCEED TO ROUND 02 →
        </button>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",position:"relative",zIndex:1,padding:"1.5rem"}}>
      {/* Light signal */}
      <div style={{position:"fixed",top:"1rem",right:"1.5rem",zIndex:10,textAlign:"center"}}>
        <div style={{width:"40px",height:"40px",borderRadius:"50%",background:light==="green"?"#00ff88":"#ff2d6d",boxShadow:`0 0 20px ${light==="green"?"#00ff88":"#ff2d6d"}`,transition:"all .5s",animation:"glow 1.5s ease infinite"}}/>
        <p style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".55rem",color:"#444",marginTop:".3rem",letterSpacing:".1em"}}>{light.toUpperCase()}</p>
      </div>

      {/* Header */}
      <div style={{textAlign:"center",marginBottom:"2rem",paddingTop:"2rem"}}>
        <p style={{fontFamily:"'Share Tech Mono',monospace",color:"#ff2d6d",fontSize:".65rem",letterSpacing:".3em",marginBottom:".5rem"}}>ROUND 01 — RED LIGHT / GREEN LIGHT</p>
        <h2 style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"1.8rem",color:"#fff"}}>PATTERN RECOGNITION</h2>
        <div style={{display:"flex",justifyContent:"center",gap:"1rem",marginTop:"1rem"}}>
          {IQ_QUESTIONS.map((_,i)=>(
            <div key={i} style={{width:"8px",height:"8px",borderRadius:"50%",background:i<answers.length?(answers[i].correct?"#00ff88":"#ff2d6d"):i===qIdx?"#fff":"#222",transition:"background .3s"}}/>
          ))}
        </div>
        <p style={{fontFamily:"'Share Tech Mono',monospace",color:"#444",fontSize:".65rem",marginTop:".75rem"}}>Q {qIdx+1} / {IQ_QUESTIONS.length}</p>
      </div>

      {/* Question Card */}
      <div style={{maxWidth:"680px",margin:"0 auto"}}>
        <div style={{background:"rgba(8,8,8,.97)",border:"1px solid rgba(255,45,109,.2)",borderRadius:"4px",padding:"2rem",marginBottom:"1rem",animation:"fadeInUp .4s ease both"}}>
          <pre style={{fontFamily:"'Noto Serif KR',serif",fontSize:"1.05rem",color:"#fff",lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:"1.5rem"}}>{q.q}</pre>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".75rem"}}>
            {q.opts.map((opt,i)=>{
              let bg="rgba(255,255,255,.03)",border="1px solid rgba(255,255,255,.08)",color="#aaa";
              if(selected!==null){
                if(i===q.ans){bg="rgba(0,255,136,.08)";border="1px solid #00ff88";color="#00ff88";}
                else if(i===selected&&selected!==q.ans){bg="rgba(255,45,109,.08)";border="1px solid #ff2d6d";color="#ff2d6d";}
              } else if(i===selected){bg="rgba(255,45,109,.1)";border="1px solid #ff2d6d";color="#ff2d6d";}
              return(
                <button key={i} onClick={()=>choose(i)} style={{padding:".9rem 1rem",background:bg,border,color,fontFamily:"'Share Tech Mono',monospace",fontSize:".82rem",cursor:selected!==null?"default":"pointer",borderRadius:"2px",textAlign:"left",transition:"all .2s",letterSpacing:".03em"}}>
                  <span style={{color:"#333",marginRight:".5rem"}}>{["A","B","C","D"][i]}.</span> {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Code reveal */}
        {showCode&&(
          <div style={{background:"rgba(0,0,0,.98)",border:"1px solid rgba(0,212,255,.2)",borderRadius:"4px",padding:"1.5rem",marginBottom:"1rem",animation:"fadeInUp .3s ease both"}}>
            <p style={{fontFamily:"'Share Tech Mono',monospace",color:"#00d4ff",fontSize:".65rem",letterSpacing:".2em",marginBottom:".75rem"}}>⌨ PYTHON SOLUTION</p>
            <pre style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".78rem",color:"#7dd3fc",lineHeight:1.7,overflowX:"auto"}}>{q.code}</pre>
            <div style={{marginTop:"1rem",display:"flex",justifyContent:"flex-end"}}>
              <button onClick={next} style={{padding:".7rem 2rem",background:"#ff2d6d",border:"none",color:"#000",fontFamily:"'Black Han Sans',sans-serif",fontSize:".85rem",letterSpacing:".15em",cursor:"pointer",boxShadow:"0 0 20px rgba(255,45,109,.4)"}}>
                {qIdx+1<IQ_QUESTIONS.length?"NEXT →":"FINISH ✓"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROUND 2 — HONEYCOMB
   ONE SHAPE · ONE TRY · HOST CONFIRMATION GATE
═══════════════════════════════════════════════════════ */

const GOOGLE_FORM_URL  = "https://example.com/answer";  /* ← swap with real form */
const HOST_CODE_ANSWER = "HOSTAJAY";                     /* ← host secret code    */

/* ── Shape challenge view ── */
function ShapeChallenge({ shape, onDone }) {
  const [formOpened,  setFormOpened]  = useState(false);
  const [hostInput,   setHostInput]   = useState("");
  const [codeBad,     setCodeBad]     = useState(false);
  const [codeShake,   setCodeShake]   = useState(false);

  const verified  = hostInput.trim() === HOST_CODE_ANSWER;
  const accentColor = shape.color;

  const openForm = () => {
    window.open(GOOGLE_FORM_URL, "_blank");
    setFormOpened(true);
  };

  const handleCodeType = (e) => {
    setHostInput(e.target.value);
    setCodeBad(false);
    setCodeShake(false);
  };

 // Inside the Round2 component, after useState/useEffect hooks
const tryProceed = async () => {
  if (!verified) return; // do nothing if code not verified

  // Update Firebase round
  const playerId = localStorage.getItem("playerId");
  if (playerId) {
    await updateDoc(doc(db, "players", playerId), {
      round: 2  // moving to Round 3
    });
  }

  // Proceed to Round 3 via callback
  if (typeof onDone === "function") {
    onDone();
  }
};

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"flex-start",
      justifyContent:"center", padding:"2rem 1.5rem", position:"relative",
      zIndex:1, overflowY:"auto" }}>
      <div style={{ width:"100%", maxWidth:"680px", animation:"fadeInUp .5s ease both" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", gap:"1rem",
          marginBottom:"2rem", paddingTop:"1rem" }}>
          <span style={{ fontSize:"2.8rem", color:accentColor,
            filter:`drop-shadow(0 0 16px ${accentColor})`, flexShrink:0 }}>
            {shape.symbol}
          </span>
          <div style={{ flex:1 }}>
            <p style={{ fontFamily:"'Share Tech Mono',monospace", color:"#555",
              fontSize:".6rem", letterSpacing:".25em", marginBottom:".25rem" }}>
              ROUND 02 · HONEYCOMB · {shape.label}
            </p>
            <h2 style={{ fontFamily:"'Black Han Sans',sans-serif",
              fontSize:"1.35rem", color:accentColor, letterSpacing:".05em" }}>
              {shape.title}
            </h2>
            <p style={{ fontFamily:"'Share Tech Mono',monospace", color:"#777",
              fontSize:".62rem", letterSpacing:".1em", marginTop:".2rem" }}>
              {shape.subtitle}
            </p>
          </div>
          {/* ONE TRY badge */}
          <div style={{ padding:".3rem .7rem", background:"rgba(255,45,109,.1)",
            border:"1px solid rgba(255,45,109,.3)", borderRadius:"2px", flexShrink:0 }}>
            <p style={{ fontFamily:"'Share Tech Mono',monospace", color:"#ff2d6d",
              fontSize:".55rem", letterSpacing:".15em" }}>ONE TRY</p>
          </div>
        </div>

        <div style={{ height:"1px",
          background:`linear-gradient(90deg,transparent,${accentColor}55,transparent)`,
          marginBottom:"2rem" }}/>

        {/* ── Question card ── */}
        <div style={{ background:"rgba(4,4,4,.98)",
          border:`1px solid ${accentColor}33`, borderRadius:"4px",
          padding:"2rem 2rem 1.75rem", marginBottom:"1.5rem",
          boxShadow:`0 0 40px ${accentColor}08`,
          position:"relative", overflow:"hidden" }}>

          {/* left colour bar */}
          <div style={{ position:"absolute", top:0, left:0, width:"3px", height:"100%",
            background:`linear-gradient(180deg,${accentColor},transparent)` }}/>

          <p style={{ fontFamily:"'Share Tech Mono',monospace", color:accentColor,
            fontSize:".6rem", letterSpacing:".25em", marginBottom:"1rem" }}>
            ◈ &nbsp;CHALLENGE QUESTION
          </p>

          <pre style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:".9rem",
            color:"#e8e8e8", lineHeight:1.9, whiteSpace:"pre-wrap",
            marginBottom:"1.75rem" }}>{shape.question}</pre>

          <div style={{ height:"1px", background:"rgba(255,255,255,.05)",
            marginBottom:"1.75rem" }}/>

          {/* ── STAGE A: Submit Answer button ── */}
          {!formOpened && (
            <button onClick={openForm} style={{
              width:"100%", padding:"1rem 1.5rem", background:accentColor,
              border:"none", borderRadius:"3px", color:"#000",
              fontFamily:"'Black Han Sans',sans-serif", fontSize:"1rem",
              letterSpacing:".2em", cursor:"pointer",
              boxShadow:`0 0 30px ${accentColor}55`,
              display:"flex", alignItems:"center", justifyContent:"center", gap:".75rem",
            }}>
              <span style={{ fontSize:"1.1rem" }}>⎆</span>
              SUBMIT ANSWER
            </button>
          )}

          {/* ── STAGE B: Waiting + host code gate ── */}
          {formOpened && (
            <div style={{ animation:"fadeInUp .45s ease both" }}>

              {/* waiting banner */}
              <div style={{ padding:"1.1rem 1.4rem",
                background:"rgba(0,255,136,.04)",
                border:"1px solid rgba(0,255,136,.2)",
                borderRadius:"3px", marginBottom:"1.5rem",
                display:"flex", alignItems:"flex-start", gap:"1rem" }}>
                <span style={{ fontSize:"1.3rem",
                  animation:"pulse 1.5s ease infinite", flexShrink:0 }}>⏳</span>
                <div>
                  <p style={{ fontFamily:"'Black Han Sans',sans-serif",
                    color:"#00ff88", fontSize:".9rem",
                    letterSpacing:".05em", marginBottom:".3rem" }}>
                    Waiting for host confirmation...
                  </p>
                  <p style={{ fontFamily:"'Share Tech Mono',monospace",
                    color:"#666", fontSize:".68rem", lineHeight:1.7 }}>
                    Your answer has been submitted via Google Form.<br/>
                    Ask your host for the confirmation code to unlock Round 3.
                  </p>
                </div>
              </div>

              {/* blinking status */}
              <p style={{ fontFamily:"'Share Tech Mono',monospace",
                color:"#2a2a2a", fontSize:".6rem", letterSpacing:".2em",
                textAlign:"center", marginBottom:"1.5rem",
                animation:"blink 1.8s ease infinite" }}>
                █ AWAITING HOST CONFIRMATION █
              </p>

              {/* host confirmation code input */}
              <div style={{ marginBottom:"1.25rem",
                animation: codeShake ? "shake .5s ease" : "none" }}>
                <label style={{ ...labelS,
                  color: codeBad ? "#ff2d6d" : verified ? "#00ff88" : "#666",
                  letterSpacing:".2em", marginBottom:".6rem",
                  display:"block" }}>
                  HOST CONFIRMATION CODE
                </label>
                <input
                  value={hostInput}
                  onChange={handleCodeType}
                  placeholder="Enter code from host..."
                  autoComplete="off"
                  spellCheck={false}
                  style={{
                    ...inputS,
                    background:"rgba(0,0,0,.7)",
                    letterSpacing:".1em",
                    border: `1px solid ${
                      verified ? "rgba(0,255,136,.55)"
                      : codeBad  ? "rgba(255,45,109,.65)"
                      : "rgba(255,255,255,.1)"}`,
                    color: verified ? "#00ff88" : "#fff",
                  }}
                />
                {/* feedback line */}
                {codeBad && !verified && (
                  <p style={{ fontFamily:"'Share Tech Mono',monospace",
                    color:"#ff2d6d", fontSize:".65rem",
                    marginTop:".45rem", letterSpacing:".05em" }}>
                    ✗ &nbsp;Incorrect code. Ask the host for the confirmation code.
                  </p>
                )}
                {verified && (
                  <p style={{ fontFamily:"'Share Tech Mono',monospace",
                    color:"#00ff88", fontSize:".65rem",
                    marginTop:".45rem", letterSpacing:".05em",
                    animation:"fadeInUp .3s ease both" }}>
                    ✓ &nbsp;Code verified — Round 3 is now unlocked!
                  </p>
                )}
              </div>

              {/* Proceed button — locked until code is correct */}
              <button onClick={tryProceed} disabled={false} style={{
                width:"100%", padding:"1rem 1.5rem",
                background: verified ? "#ff2d6d" : "rgba(255,255,255,.03)",
                border:`1px solid ${verified ? "#ff2d6d" : "rgba(255,255,255,.07)"}`,
                borderRadius:"3px",
                color: verified ? "#000" : "#2a2a2a",
                fontFamily:"'Black Han Sans',sans-serif",
                fontSize:".9rem", letterSpacing:".2em",
                cursor: verified ? "pointer" : "not-allowed",
                transition:"all .35s",
                boxShadow: verified ? "0 0 28px rgba(255,45,109,.45)" : "none",
              }}>
                {verified ? "PROCEED TO ROUND 03 →" : "🔒  LOCKED — ENTER HOST CODE"}
              </button>
            </div>
          )}
        </div>

        <p style={{ fontFamily:"'Share Tech Mono',monospace",
          color:"#1a1a1a", fontSize:".58rem",
          letterSpacing:".15em", textAlign:"center" }}>
          ONE SHAPE · ONE TRY · HOST CONFIRMS ALL
        </p>
      </div>
    </div>
  );
}

/* Shape metadata with question text */
const SHAPE_DATA = {
  circle: {
    id: "circle", symbol: "○", label: "CIRCLE", color: "#00d4ff",
    title: "CIRCLE 🔴 : BASIC ML LOGIC",
    subtitle: "VERY EASY — DATA THRESHOLD CLASSIFICATION",
    sub: "Basic ML Logic · Threshold Classification",
    question: `Question 1 – Data Threshold Classification

Dataset:
  34   76   50   81   29

Task:
  Classify numbers based on rule:
    ▸ Value > 50  →  High
    ▸ Value ≤ 50  →  Low

Example Output:
  34  →  Low
  76  →  High
  50  →  Low
  81  →  High
  29  →  Low

ML Concept:
  This simulates a simple decision boundary used
  in classification models.`,
  },
  triangle: {
    id: "triangle", symbol: "▲", label: "TRIANGLE", color: "#ff2d6d",
    title: "TRIANGLE ▲ : CLASS FREQUENCY",
    subtitle: "COUNT OCCURRENCES OF EACH CLASS",
    sub: "Class Frequency · Counter",
    question: `Question 1 – Class Frequency Count

Dataset:
  cat   dog   cat   dog   cat

Task:
  Count occurrences of each class.

Example Output:
  cat = 3
  dog = 2

ML Concept:
  Understanding class distribution in datasets.`,
  },
  square: {
    id: "square", symbol: "■", label: "SQUARE", color: "#f59e0b",
    title: "SQUARE ■ : FEATURE COUNTING",
    subtitle: "DATA PREPROCESSING — FEATURE FILTERING",
    sub: "Feature Counting · Preprocessing",
    question: `Question 1 – Feature Counting

Dataset:
  12   65   23   90   44   77

Task:
  Count how many numbers are greater than 50.

Example Output:
  3

ML Concept:
  This represents feature filtering
  in data preprocessing.`,
  },
  umbrella: {
    id: "umbrella", symbol: "☂", label: "UMBRELLA", color: "#a855f7",
    title: "UMBRELLA ☂ : SPAM DETECTOR",
    subtitle: "SIMPLE AI IDEA — KEYWORD CLASSIFICATION",
    sub: "Spam Detector · NLP Basics",
    question: `Problem – Spam Detector (Simple AI Idea)

Write a program that checks if a message is Spam.
  ▸ If message contains the word "win"  →  print Spam
  ▸ Otherwise                           →  print Not Spam

Input  :  win a free iphone
Output :  Spam

ML Concept:
  Keyword-based text classification —
  the foundation of NLP spam filters.`,
  },
};

/* ── TEAM LEADERS MOVE FORWARD cinematic ── */
function TeamLeaderScreen({onContinue}){
  const [step,setStep]=useState(0);
  useEffect(()=>{
    const timers=[
      setTimeout(()=>setStep(1),600),
      setTimeout(()=>setStep(2),1800),
      setTimeout(()=>setStep(3),3200),
    ];
    return()=>timers.forEach(clearTimeout);
  },[]);

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1,background:"rgba(2,2,2,.98)"}}>
      {/* Spotlight line */}
      <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"2px",height:"100%",background:"linear-gradient(180deg,transparent,rgba(255,45,109,.15),transparent)",pointerEvents:"none"}}/>

      <div style={{textAlign:"center",maxWidth:"600px",padding:"2rem"}}>
        {step>=1&&(
          <div style={{animation:"fadeInUp .7s ease both"}}>
            <div style={{display:"flex",justifyContent:"center",gap:"3rem",marginBottom:"2.5rem"}}>
              {/* Guard silhouettes */}
              {["◀","▶"].map((d,i)=>(
                <div key={i} style={{textAlign:"center",animation:`${i===0?"slideInLeft":"slideInRight"} .8s ease both`}}>
                  <div style={{fontSize:"3.5rem",marginBottom:".3rem"}}>🟥</div>
                  <div style={{width:"2px",height:"60px",background:"rgba(255,45,109,.3)",margin:"0 auto"}}/>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".55rem",color:"#ff2d6d44",letterSpacing:".2em",marginTop:".3rem"}}>GUARD {i+1}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step>=2&&(
          <div style={{animation:"fadeInUp .7s ease both"}}>
            <p style={{fontFamily:"'Share Tech Mono',monospace",color:"#ff2d6d",fontSize:".7rem",letterSpacing:".4em",marginBottom:"1rem",animation:"blink 1.5s ease infinite"}}>⬛ ANNOUNCEMENT ⬛</p>
            <h1 style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"clamp(1.8rem,6vw,3rem)",color:"#fff",letterSpacing:".08em",lineHeight:1.3,marginBottom:"1rem",textShadow:"0 0 40px rgba(255,255,255,.15)"}}>
              TEAM LEADERS<br/>
              <span style={{color:"#ff2d6d",textShadow:"0 0 30px rgba(255,45,109,.7)"}}>MOVE FORWARDS</span>
            </h1>
          </div>
        )}

        {step>=3&&(
          <div style={{animation:"fadeInUp .6s ease both"}}>
            <div style={{margin:"1.5rem auto",padding:"1rem 2rem",border:"1px solid rgba(255,45,109,.2)",borderRadius:"2px",background:"rgba(255,45,109,.04)",maxWidth:"420px"}}>
              <p style={{fontFamily:"'Noto Serif KR',serif",color:"#888",fontSize:".85rem",lineHeight:1.8}}>
                Your team leader must step forward and choose a shape.<br/>
                <span style={{color:"#ff2d6d"}}>Each shape is a different challenge.</span><br/>
                Complete all four to advance.
              </p>
            </div>

            {/* 4 shapes preview */}
            <div style={{display:"flex",justifyContent:"center",gap:"1.5rem",margin:"1.5rem 0 2rem"}}>
              {[["○","#00d4ff"],["▲","#ff2d6d"],["■","#f59e0b"],["☂","#a855f7"]].map(([sym,col],i)=>(
                <div key={i} style={{fontSize:"2rem",color:col,filter:`drop-shadow(0 0 10px ${col})`,animation:`honeyReveal .5s ${i*.12}s ease both`}}>{sym}</div>
              ))}
            </div>

            <button onClick={onContinue} style={{padding:"1rem 3rem",background:"#ff2d6d",border:"none",color:"#000",fontFamily:"'Black Han Sans',sans-serif",fontSize:"1rem",letterSpacing:".2em",cursor:"pointer",boxShadow:"0 0 30px rgba(255,45,109,.5)",animation:"glow 2s ease infinite"}}>
              CHOOSE YOUR SHAPE →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ROUND 2 MAIN CONTROLLER ── */
function Round2Game({onComplete}){
  const [phase,setPhase]         = useState("loading"); // loading|leader|shapes|challenge|done
  const [loadPct,setLoadPct]     = useState(0);
  const [chosen,setChosen]       = useState(null);  // id of the ONE selected shape (null = none yet)

  useEffect(()=>{
    if(phase!=="loading") return;
    const iv=setInterval(()=>{
      setLoadPct(p=>{
        if(p>=100){clearInterval(iv);setTimeout(()=>setPhase("leader"),400);return 100;}
        return p+2;
      });
    },100);
    return()=>clearInterval(iv);
  },[phase]);

  const SHAPES_META = Object.values(SHAPE_DATA);

  const pickShape = (id) => {
    if(chosen) return;       // already locked — no second pick
    setChosen(id);
    setPhase("challenge");
  };

  const onChallengeDone = () => {
    setPhase("done");
  };

  /* ── Loading ── */
  if(phase==="loading") return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",position:"relative",zIndex:1}}>
      <div style={{textAlign:"center"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2rem",marginBottom:"2rem"}}>
          {SHAPES_META.map((s,i)=>(
            <div key={s.id} style={{fontSize:"3rem",color:s.color,
              opacity:Math.min(loadPct/100+i*.05,1),
              animation:`honeyReveal .6s ${i*.15}s ease both`,
              filter:`drop-shadow(0 0 15px ${s.color})`,textAlign:"center"}}>
              {s.symbol}
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".6rem",
                color:"#444",marginTop:".3rem",letterSpacing:".2em"}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{width:"280px",height:"3px",background:"rgba(255,255,255,.05)",
          borderRadius:"2px",overflow:"hidden",margin:"0 auto"}}>
          <div style={{height:"100%",background:"linear-gradient(90deg,#ff2d6d,#a855f7)",
            width:`${loadPct}%`,transition:"width .1s"}}/>
        </div>
        <p style={{fontFamily:"'Share Tech Mono',monospace",color:"#555",fontSize:".65rem",
          marginTop:".75rem",letterSpacing:".2em"}}>HONEYCOMB LOADING... {Math.round(loadPct)}%</p>
      </div>
    </div>
  );

  /* ── Cinematic leader screen ── */
  if(phase==="leader") return <TeamLeaderScreen onContinue={()=>setPhase("shapes")}/>;

  /* ── Active shape challenge ── */
  if(phase==="challenge" && chosen){
    return <ShapeChallenge shape={SHAPE_DATA[chosen]} onDone={onChallengeDone}/>;
  }

  /* ── Cleared / all done ── */
  if(phase==="done") return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",
      justifyContent:"center",position:"relative",zIndex:1}}>
      <div style={{textAlign:"center",animation:"fadeInUp .6s ease both"}}>
        <span style={{fontSize:"3rem",color:SHAPE_DATA[chosen]?.color,
          filter:`drop-shadow(0 0 16px ${SHAPE_DATA[chosen]?.color})`}}>
          {SHAPE_DATA[chosen]?.symbol}
        </span>
        <h2 style={{fontFamily:"'Black Han Sans',sans-serif",
          fontSize:"2.5rem",color:"#00ff88",marginTop:"1rem"}}>HONEYCOMB CLEARED</h2>
        <p style={{fontFamily:"'Share Tech Mono',monospace",color:"#555",
          fontSize:".75rem",letterSpacing:".2em",margin:"1rem 0 2rem"}}>
          SHAPE CONFIRMED BY HOST · CHALLENGE COMPLETE
        </p>
        <button onClick={onComplete} style={{padding:"1rem 3rem",background:"#ff2d6d",
          border:"none",color:"#000",fontFamily:"'Black Han Sans',sans-serif",
          fontSize:"1rem",letterSpacing:".2em",cursor:"pointer",
          boxShadow:"0 0 30px rgba(255,45,109,.4)"}}>
          ROUND 03 — TUG OF WAR →
        </button>
      </div>
    </div>
  );

  /* ── Shape selection grid (ONE PICK ONLY) ── */
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:"2rem",
      position:"relative",zIndex:1}}>
      <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
        <p style={{fontFamily:"'Share Tech Mono',monospace",color:"#ff2d6d",
          fontSize:".65rem",letterSpacing:".3em",marginBottom:".5rem"}}>
          ROUND 02 — HONEYCOMB
        </p>
        <h2 style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"2rem",color:"#fff"}}>
          CHOOSE YOUR SHAPE
        </h2>
        <p style={{fontFamily:"'Share Tech Mono',monospace",color:"#ff2d6d",
          fontSize:".68rem",marginTop:".5rem",letterSpacing:".1em",
          animation:"pulse 2s ease infinite"}}>
          ⚠ &nbsp;ONE SHAPE ONLY — CHOOSE CAREFULLY
        </p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem",
        maxWidth:"560px",width:"100%"}}>
        {SHAPES_META.map((s,i)=>{
          const isSelected = chosen === s.id;
          const isLocked   = chosen && chosen !== s.id; // another was chosen
          return(
            <button key={s.id}
              onClick={()=>pickShape(s.id)}
              disabled={!!isLocked}
              style={{
                padding:"2rem 1.5rem",
                background: isSelected
                  ? `${s.color}18`
                  : isLocked
                    ? "rgba(4,4,4,.7)"
                    : "rgba(8,8,8,.96)",
                border: `2px solid ${
                  isSelected ? s.color
                  : isLocked ? "rgba(255,255,255,.05)"
                  : s.color+"55"}`,
                borderRadius:"6px",
                cursor: isLocked ? "not-allowed" : "pointer",
                textAlign:"center",
                transition:"all .3s",
                animation:`honeyReveal .5s ${i*.1}s ease both`,
                boxShadow: isSelected ? `0 0 30px ${s.color}44` : "none",
                opacity: isLocked ? 0.3 : 1,
              }}>
              <div style={{
                fontSize:"3.2rem",
                color: isSelected ? s.color : isLocked ? "#333" : s.color,
                filter:`drop-shadow(0 0 ${isSelected?20:isLocked?0:14}px ${isSelected?s.color:s.color})`,
                marginBottom:".75rem",transition:"all .3s"}}>
                {s.symbol}
              </div>
              <p style={{fontFamily:"'Black Han Sans',sans-serif",
                color: isLocked ? "#2a2a2a" : "#fff",
                fontSize:"1rem",letterSpacing:".08em",marginBottom:".3rem"}}>
                {s.label}
              </p>
              <p style={{fontFamily:"'Share Tech Mono',monospace",
                color: isLocked ? "#1a1a1a" : s.color+"99",
                fontSize:".58rem",letterSpacing:".05em",lineHeight:1.5}}>
                {isLocked ? "LOCKED" : s.sub}
              </p>
              {!isLocked && (
                <div style={{marginTop:"1rem",padding:".45rem",
                  background:s.color,borderRadius:"2px",
                  fontFamily:"'Black Han Sans',sans-serif",
                  fontSize:".7rem",color:"#000",letterSpacing:".15em"}}>
                  SELECT →
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROUND 3 — TUG OF WAR · ML MODEL CTF CHALLENGE
═══════════════════════════════════════════════════════ */
const CORRECT_FLAG      = "SQUIDGAME{H0neycoMb}";
const VIS_FILE_URL      = "vis.py"; /* ← replace with hosted file URL */

function Round3Game({onComplete}){
  const [phase,      setPhase]      = useState("intro"); // intro|play|win
  const [flagInput,  setFlagInput]  = useState("");
  const [flagResult, setFlagResult] = useState(null);    // null|"wrong"
  const [shake,      setShake]      = useState(false);
  const [attempts,   setAttempts]   = useState(0);
  const [cursorOn,   setCursorOn]   = useState(true);
  const inputRef = useRef(null);
  
  const playerId = localStorage.getItem("playerId");
  
  /* blinking terminal cursor */
  useEffect(()=>{
    const iv = setInterval(()=>setCursorOn(c=>!c), 530);
    return ()=>clearInterval(iv);
  },[]);

  useEffect(()=>{
    if(phase==="play" && inputRef.current) inputRef.current.focus();
  },[phase]);
  
  const submitFlag = async () => { // Added 'async' here
    const val = flagInput.trim();
    if(!val) return;
    
    setAttempts(a => a + 1);
    
    if(val === CORRECT_FLAG){
        if(playerId) {
            try {
                // Now await will work without errors
                await updateDoc(doc(db, "players", playerId.toString()), {
                    round: 3,       // completed Tug of War
                    status: "alive" // or "survived"
                });
                
                // You might want to add success logic here
                alert("ACCESS GRANTED: ROUND COMPLETE");
            } catch (error) {
                console.error("Error updating player status:", error);
            }
        }
      setPhase("win");
    } else {
      setFlagResult("wrong");
      setShake(true);
      setTimeout(()=>{ setShake(false); setFlagResult(null); }, 1200);
    }
  };

  const mono = "'Share Tech Mono',monospace";
  const han  = "'Black Han Sans',sans-serif";

  /* ── INTRO ── */
  if(phase==="intro") return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",
      justifyContent:"center",padding:"2rem",position:"relative",zIndex:1}}>
      <div style={{textAlign:"center",animation:"fadeInUp .6s ease both",maxWidth:"540px"}}>
        <div style={{fontSize:"4.5rem",marginBottom:"1.5rem",
          animation:"tugLeft 1.8s ease-in-out infinite",display:"inline-block"}}>🪢</div>
        <p style={{fontFamily:mono,color:"#ff2d6d",fontSize:".65rem",
          letterSpacing:".4em",marginBottom:".75rem"}}>ROUND 03</p>
        <h1 style={{fontFamily:han,fontSize:"clamp(2rem,6vw,3rem)",
          color:"#fff",letterSpacing:".08em",lineHeight:1.2,marginBottom:".4rem"}}>
          TUG OF WAR
        </h1>
        <h2 style={{fontFamily:han,fontSize:"1.1rem",color:"#ff2d6d",
          letterSpacing:".18em",marginBottom:"2rem"}}>
          ML MODEL CHALLENGE
        </h2>
        <div style={{height:"1px",background:"linear-gradient(90deg,transparent,rgba(255,45,109,.4),transparent)",marginBottom:"2rem"}}/>
        <div style={{padding:"1.25rem 1.5rem",background:"rgba(255,45,109,.04)",
          border:"1px solid rgba(255,45,109,.15)",borderRadius:"4px",
          marginBottom:"2rem",textAlign:"left"}}>
          <p style={{fontFamily:mono,color:"#555",fontSize:".6rem",
            letterSpacing:".2em",marginBottom:".75rem"}}>BRIEFING</p>
          <p style={{fontFamily:"'Noto Serif KR',serif",color:"#aaa",
            fontSize:".88rem",lineHeight:1.8}}>
            You are given a visualization script. Train a neural network that draws the correct shape. Download the file, analyze the architecture, and submit the right flag to survive.
          </p>
        </div>
        <button onClick={()=>setPhase("play")} style={{
          padding:"1rem 3rem",background:"#ff2d6d",border:"none",color:"#000",
          fontFamily:han,fontSize:"1rem",letterSpacing:".2em",cursor:"pointer",
          boxShadow:"0 0 30px rgba(255,45,109,.45)",
          animation:"glow 2s ease infinite",borderRadius:"3px"}}>
          VIEW CHALLENGE
        </button>
      </div>
    </div>
  );

  /* ── WIN ── */
  if(phase==="win") return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",
      justifyContent:"center",padding:"2rem",position:"relative",zIndex:1,
      background:"radial-gradient(circle at center,rgba(0,255,136,.04) 0%,transparent 70%)"}}>
      <div style={{textAlign:"center",animation:"fadeInUp .6s ease both",maxWidth:"520px"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>🏆</div>
        <h2 style={{fontFamily:han,fontSize:"2.5rem",color:"#00ff88",
          textShadow:"0 0 30px rgba(0,255,136,.5)",marginBottom:".5rem"}}>
          CORRECT FLAG
        </h2>
        <p style={{fontFamily:han,fontSize:"1.1rem",color:"#fff",
          letterSpacing:".04em",marginBottom:"2rem"}}>
          You survived Tug of War.
        </p>
        <div style={{padding:"1rem 1.5rem",background:"rgba(0,0,0,.95)",
          border:"1px solid rgba(0,255,136,.25)",borderRadius:"3px",
          marginBottom:"2rem",fontFamily:mono,fontSize:".85rem",
          color:"#00ff88",letterSpacing:".08em",textAlign:"left"}}>
          <span style={{color:"#444"}}>$ ./check_flag &nbsp;</span>
          <span style={{color:"#ff2d6d"}}>{CORRECT_FLAG}</span>
          <br/>
          <span style={{color:"#555"}}>→ &nbsp;</span>
          <span style={{animation:"pulse 1.5s ease infinite"}}>✓ FLAG ACCEPTED — TEAM SURVIVES</span>
        </div>
        <p style={{fontFamily:mono,color:"#2a2a2a",fontSize:".6rem",
          letterSpacing:".15em",marginBottom:"2rem"}}>
          ATTEMPTS: {attempts}
        </p>
        <button onClick={onComplete} style={{
          padding:"1rem 3rem",background:"#ff2d6d",border:"none",color:"#000",
          fontFamily:han,fontSize:"1rem",letterSpacing:".2em",cursor:"pointer",
          boxShadow:"0 0 30px rgba(255,45,109,.45)",borderRadius:"3px"}}>
          FINAL ROUND →
        </button>
      </div>
    </div>
  );

  /* ── PLAY / CHALLENGE VIEW ── */
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",padding:"2rem 1.5rem",position:"relative",
      zIndex:1,overflowY:"auto"}}>
      <div style={{width:"100%",maxWidth:"760px",paddingTop:"1.5rem",
        animation:"fadeInUp .5s ease both"}}>

        {/* ── Page header ── */}
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <p style={{fontFamily:mono,color:"#ff2d6d",fontSize:".6rem",
            letterSpacing:".35em",marginBottom:".5rem"}}>
            ROUND 03 · TUG OF WAR · ML MODEL
          </p>
          <h2 style={{fontFamily:han,fontSize:"clamp(1.4rem,4vw,2rem)",
            color:"#fff",letterSpacing:".06em",marginBottom:".3rem"}}>
            TUG OF WAR – ML MODEL
          </h2>
          <p style={{fontFamily:han,fontSize:".85rem",color:"#ff2d6d",
            letterSpacing:".15em"}}>
            Neural Shape Generator Challenge
          </p>
          <div style={{height:"1px",background:"linear-gradient(90deg,transparent,rgba(255,45,109,.3),transparent)",marginTop:"1rem"}}/>
        </div>

        {/* ── Challenge description card ── */}
        <div style={{background:"rgba(4,4,4,.98)",
          border:"1px solid rgba(255,45,109,.2)",borderRadius:"4px",
          padding:"2rem",marginBottom:"1.5rem",
          position:"relative",overflow:"hidden"}}>

          {/* left accent bar */}
          <div style={{position:"absolute",top:0,left:0,width:"3px",height:"100%",
            background:"linear-gradient(180deg,#ff2d6d,transparent)"}}/>

          <p style={{fontFamily:mono,color:"#ff2d6d",fontSize:".6rem",
            letterSpacing:".25em",marginBottom:"1.25rem"}}>
            ◈ &nbsp;CHALLENGE DESCRIPTION
          </p>

          {/* Overview */}
          <p style={{fontFamily:"'Noto Serif KR',serif",color:"#bbb",
            fontSize:".9rem",lineHeight:1.9,marginBottom:"1.5rem"}}>
            You are given a visualization script that loads a neural network model
            (<span style={{color:"#00d4ff",fontFamily:mono}}>model.pt</span>) and
            evaluates points in a 2D coordinate grid. Your task is to create and
            train a neural network model that produces a specific geometric pattern
            when visualized.
          </p>

          {/* What the script does */}
          <div style={{padding:"1rem 1.25rem",background:"rgba(0,0,0,.6)",
            border:"1px solid rgba(255,255,255,.06)",borderRadius:"3px",
            marginBottom:"1.5rem"}}>
            <p style={{fontFamily:mono,color:"#555",fontSize:".6rem",
              letterSpacing:".2em",marginBottom:".75rem"}}>
              THE VISUALIZATION SCRIPT WILL
            </p>
            {[
              ["📂","Load your","model.pt"],
              ["📐","Evaluate (x, y) coordinates between 0 and 1"],
              ["🔢","Classify each point as 0 or 1"],
              ["📊","Plot the classified points on a graph"],
            ].map(([ico,txt,code],i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:".75rem",
                marginBottom:i<3?".6rem":0}}>
                <span style={{fontSize:".85rem",flexShrink:0,marginTop:".1rem"}}>{ico}</span>
                <p style={{fontFamily:mono,color:"#888",fontSize:".78rem",lineHeight:1.6}}>
                  {txt}{code&&<>&nbsp;<span style={{color:"#00d4ff"}}>{code}</span></>}
                </p>
              </div>
            ))}
          </div>

          {/* Requirements */}
          <p style={{fontFamily:mono,color:"#ff2d6d",fontSize:".6rem",
            letterSpacing:".25em",marginBottom:".9rem"}}>
            ◈ &nbsp;REQUIREMENTS
          </p>
          {[
            "Write a training script that generates labeled data (x, y → label).",
            "Train a neural network with the same architecture used in the visualization file.",
            "Export your trained model as:   circle_model.pt  /  triangle_model.pt  /  umbrella_model.pt",
            "When the visualization script loads your model, the plotted points must clearly form the shape.",
          ].map((req,i)=>(
            <div key={i} style={{display:"flex",gap:".75rem",
              marginBottom:".6rem",alignItems:"flex-start"}}>
              <span style={{fontFamily:mono,color:"#ff2d6d",fontSize:".75rem",
                flexShrink:0,marginTop:".1rem"}}>{i+1}.</span>
              <p style={{fontFamily:mono,color:"#999",fontSize:".78rem",lineHeight:1.7}}>
                {req}
              </p>
            </div>
          ))}

          {/* Expected output */}
          <div style={{marginTop:"1.25rem",padding:"1rem 1.25rem",
            background:"rgba(0,212,255,.04)",
            border:"1px solid rgba(0,212,255,.15)",borderRadius:"3px",
            marginBottom:"1.5rem"}}>
            <p style={{fontFamily:mono,color:"#00d4ff",fontSize:".6rem",
              letterSpacing:".2em",marginBottom:".6rem"}}>EXPECTED OUTPUT</p>
            <pre style={{fontFamily:mono,fontSize:".8rem",color:"#7dd3fc",lineHeight:1.9}}>
{`$ python vis.py
→  Graph displays the intended shape`}
            </pre>
          </div>

          {/* Constraints */}
          <div style={{padding:"1rem 1.25rem",background:"rgba(255,45,109,.04)",
            border:"1px solid rgba(255,45,109,.12)",borderRadius:"3px"}}>
            <p style={{fontFamily:mono,color:"#ff2d6d",fontSize:".6rem",
              letterSpacing:".2em",marginBottom:".6rem"}}>CONSTRAINTS</p>
            {[
              "Input domain:  0 ≤ x ≤ 1,  0 ≤ y ≤ 1",
              "Model must be saved as PyTorch  .pt  format",
              "Do NOT modify the visualization script",
              "Only provide the trained model file",
            ].map((c,i)=>(
              <p key={i} style={{fontFamily:mono,color:"#888",fontSize:".75rem",
                lineHeight:1.8,display:"flex",gap:".5rem"}}>
                <span style={{color:"#ff2d6d"}}>▸</span>{c}
              </p>
            ))}
          </div>
        </div>

        {/* ── Download challenge file ── */}
        <div style={{background:"rgba(4,4,4,.98)",
          border:"1px solid rgba(0,212,255,.2)",borderRadius:"4px",
          padding:"1.5rem 2rem",marginBottom:"1.5rem"}}>
          <p style={{fontFamily:mono,color:"#00d4ff",fontSize:".6rem",
            letterSpacing:".25em",marginBottom:"1rem"}}>
            ◈ &nbsp;CHALLENGE FILE
          </p>
          <div style={{display:"flex",alignItems:"center",
            justifyContent:"space-between",flexWrap:"wrap",gap:"1rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
              <span style={{fontSize:"2rem"}}>🐍</span>
              <div>
                <p style={{fontFamily:mono,color:"#fff",fontSize:".85rem",
                  letterSpacing:".05em"}}>vis.py</p>
                <p style={{fontFamily:mono,color:"#555",fontSize:".62rem",
                  letterSpacing:".08em"}}>
                  Visualization script — analyze the model architecture
                </p>
              </div>
            </div>
            <a href={VIS_FILE_URL} download="vis.py"
              style={{
                padding:".75rem 1.75rem",
                background:"#00d4ff",
                border:"none",
                borderRadius:"3px",
                color:"#000",
                fontFamily:han,
                fontSize:".85rem",
                letterSpacing:".15em",
                cursor:"pointer",
                textDecoration:"none",
                boxShadow:"0 0 22px rgba(0,212,255,.4)",
                display:"inline-flex",
                alignItems:"center",
                gap:".5rem",
                whiteSpace:"nowrap",
              }}>
              ⬇ &nbsp;DOWNLOAD CHALLENGE FILE
            </a>
          </div>
        </div>

        {/* ── Terminal flag input ── */}
        <div style={{background:"rgba(4,4,4,.98)",
          border:"1px solid rgba(255,45,109,.2)",borderRadius:"4px",
          padding:"1.75rem 2rem",marginBottom:"1.5rem"}}>

          <p style={{fontFamily:mono,color:"#ff2d6d",fontSize:".6rem",
            letterSpacing:".25em",marginBottom:"1.25rem"}}>
            ◈ &nbsp;ENTER THE FLAG
          </p>

          {/* terminal box */}
          <div style={{
            background:"rgba(0,0,0,.97)",
            border:`1px solid ${flagResult==="wrong"
              ? "rgba(255,45,109,.65)"
              : "rgba(255,255,255,.08)"}`,
            borderRadius:"3px",
            padding:"1rem 1.25rem",
            animation: shake ? "shake .5s ease" : "none",
            transition:"border-color .3s",
          }}>
            {/* macOS-style top bar */}
            <div style={{display:"flex",alignItems:"center",gap:".5rem",
              marginBottom:".75rem"}}>
              <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#ff2d6d"}}/>
              <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#f59e0b"}}/>
              <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#00ff88"}}/>
              <span style={{fontFamily:mono,color:"#2a2a2a",fontSize:".58rem",
                marginLeft:".5rem",letterSpacing:".12em"}}>ctf-terminal — bash</span>
            </div>

            {/* prompt */}
            <div style={{display:"flex",alignItems:"center",gap:".5rem",
              marginBottom:".5rem"}}>
              <span style={{fontFamily:mono,color:"#00ff88",fontSize:".8rem",flexShrink:0}}>
                player@squidgame:~$
              </span>
              <span style={{fontFamily:mono,color:"#666",fontSize:".8rem"}}>
                ./submit_flag
              </span>
            </div>

            {/* input row */}
            <div style={{display:"flex",alignItems:"center",gap:".5rem",
              marginBottom:"1rem"}}>
              <span style={{fontFamily:mono,color:"#ff2d6d",fontSize:".8rem",flexShrink:0}}>
                FLAG&gt;
              </span>
              <input
                ref={inputRef}
                value={flagInput}
                onChange={e=>setFlagInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&submitFlag()}
                placeholder="SQUIDGAME{...}"
                spellCheck={false}
                autoComplete="off"
                style={{
                  flex:1, background:"transparent", border:"none", outline:"none",
                  fontFamily:mono, fontSize:".88rem",
                  color:"#00d4ff", letterSpacing:".05em", caretColor:"#ff2d6d",
                }}
              />
              <span style={{
                width:"2px", height:"1.1em", background:"#ff2d6d",
                opacity:cursorOn?1:0, flexShrink:0, transition:"opacity .05s",
              }}/>
            </div>

            {/* wrong flag feedback */}
            {flagResult==="wrong" && (
              <p style={{fontFamily:mono,color:"#ff2d6d",fontSize:".75rem",
                letterSpacing:".08em",marginBottom:".75rem",
                animation:"fadeInUp .2s ease both"}}>
                ✗ &nbsp;Wrong Flag. Try Again.
              </p>
            )}

            {attempts>0 && flagResult!=="wrong" && (
              <p style={{fontFamily:mono,color:"#252525",fontSize:".6rem",
                letterSpacing:".1em",marginBottom:".6rem"}}>
                ATTEMPTS: {attempts}
              </p>
            )}

            <button onClick={submitFlag} style={{
              padding:".65rem 1.75rem",background:"#ff2d6d",
              border:"none",color:"#000",fontFamily:han,
              fontSize:".85rem",letterSpacing:".2em",cursor:"pointer",
              borderRadius:"2px",boxShadow:"0 0 18px rgba(255,45,109,.35)",
            }}>
              SUBMIT FLAG ↵
            </button>
          </div>

          <p style={{fontFamily:mono,color:"#1a1a1a",fontSize:".6rem",
            letterSpacing:".15em",marginTop:".9rem",textAlign:"center"}}>
            HINT: THE FLAG IS HIDDEN IN THE CHALLENGE · PRESS ENTER OR CLICK SUBMIT
          </p>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FINAL BOSS — PASSWORD WAR
   Flow: loading cinematic → instructions → credential form
         → win screen  |  try-again screen
═══════════════════════════════════════════════════════ */

/* ── correct credentials (swap these for the real ones later) ── */
const PW_USERNAME = "opponent_admin";
const PW_PASSWORD = "X0R_SQUID_2026";

const buildFinalCredentials = (team) => {
  if (!team || !team.teamName || !team.teamId) return { username: PW_USERNAME, password: PW_PASSWORD };
  const cleanName = team.teamName.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
  return {
    username: `${cleanName}_admin`,
    password: `SQUID_${team.teamId}`,
  };
};

/* shared style shortcuts */
const _mono = "'Share Tech Mono',monospace";
const _han  = "'Black Han Sans',sans-serif";
const _serif= "'Noto Serif KR',serif";

/* ── Loading / Cinematic ── */
function FinalBossLoading({onDone}){
  const [pct,setPct]  = useState(0);
  const [step,setStep]= useState(0); // 0 blank, 1 blood, 2 text, 3 cta
  useEffect(()=>{
    /* progress bar */
    const iv=setInterval(()=>{
      setPct(p=>{ if(p>=100){clearInterval(iv);return 100;} return p+1; });
    },50);
    /* reveal steps */
    const t1=setTimeout(()=>setStep(1), 800);
    const t2=setTimeout(()=>setStep(2),2400);
    const t3=setTimeout(()=>setStep(3),4200);
    const t4=setTimeout(()=>onDone(),  5800);
    return()=>{clearInterval(iv);[t1,t2,t3,t4].forEach(clearTimeout);};
  },[onDone]);

  return(
    <div style={{
      minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      background:"radial-gradient(ellipse at center,rgba(80,0,0,.35) 0%,#050505 70%)",
      position:"relative",zIndex:1,overflow:"hidden",
    }}>
      {/* scanline overlay */}
      <div style={{position:"fixed",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,0,0,.015) 3px,rgba(255,0,0,.015) 6px)",pointerEvents:"none",zIndex:2}}/>

      {/* Blood drip top */}
      {step>=1&&(
        <div style={{position:"absolute",top:0,left:0,right:0,display:"flex",justifyContent:"space-around",zIndex:3,animation:"fadeIn .5s ease both"}}>
          {Array.from({length:9},(_,i)=>(
            <div key={i} style={{
              width:`${3+i%3}px`,
              height:`${40+i*12}px`,
              background:"linear-gradient(180deg,#8b0000,#ff2d6d88)",
              borderRadius:"0 0 50% 50%",
              marginTop:0,
              opacity:.7+(i%3)*.1,
              animation:`fadeInUp ${.3+i*.08}s ease both`,
            }}/>
          ))}
        </div>
      )}

      {/* Central content */}
      <div style={{textAlign:"center",zIndex:4,padding:"2rem"}}>

        {step>=1&&(
          <div style={{animation:"fadeInUp .8s ease both",marginBottom:"1.5rem"}}>
            {/* two figures facing each other */}
            <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:"3rem",marginBottom:"1rem"}}>
              <div style={{textAlign:"center",animation:"slideInLeft .8s ease both"}}>
                <div style={{fontSize:"3.5rem",filter:"drop-shadow(0 0 20px #ff2d6d)"}}>🟥</div>
                <div style={{width:"2px",height:"50px",background:"linear-gradient(180deg,#ff2d6d,transparent)",margin:".3rem auto 0"}}/>
                <p style={{fontFamily:_mono,color:"#ff2d6d55",fontSize:".5rem",letterSpacing:".2em",marginTop:".3rem"}}>PLAYER 1</p>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:".3rem"}}>
                <span style={{fontFamily:_han,color:"#ff2d6d",fontSize:"2rem",animation:"pulse 1s ease infinite",textShadow:"0 0 30px #ff2d6d"}}>⚔</span>
                <span style={{fontFamily:_mono,color:"#333",fontSize:".55rem",letterSpacing:".2em"}}>VS</span>
              </div>
              <div style={{textAlign:"center",animation:"slideInRight .8s ease both"}}>
                <div style={{fontSize:"3.5rem",filter:"drop-shadow(0 0 20px #00d4ff)"}}>🟦</div>
                <div style={{width:"2px",height:"50px",background:"linear-gradient(180deg,#00d4ff,transparent)",margin:".3rem auto 0"}}/>
                <p style={{fontFamily:_mono,color:"#00d4ff55",fontSize:".5rem",letterSpacing:".2em",marginTop:".3rem"}}>PLAYER 2</p>
              </div>
            </div>
          </div>
        )}

        {step>=2&&(
          <div style={{animation:"fadeInUp .7s ease both"}}>
            <p style={{fontFamily:_mono,color:"#ff2d6d",fontSize:".65rem",letterSpacing:".5em",marginBottom:".75rem",animation:"blink 1.2s ease infinite"}}>
              ⬛ FINAL ROUND ⬛
            </p>
            <h1 style={{
              fontFamily:_han,
              fontSize:"clamp(2.2rem,7vw,4rem)",
              color:"#fff",letterSpacing:".08em",lineHeight:1.1,
              textShadow:"0 0 60px rgba(255,45,109,.7), 0 0 120px rgba(255,45,109,.3)",
              marginBottom:".4rem",
            }}>
              SQUID GAME
            </h1>
            <h2 style={{
              fontFamily:_han,fontSize:"clamp(1.4rem,4vw,2.2rem)",
              color:"#ff2d6d",letterSpacing:".2em",
              textShadow:"0 0 30px rgba(255,45,109,.5)",
              marginBottom:".75rem",
            }}>
              FINAL BOSS
            </h2>
            <p style={{fontFamily:_serif,color:"#666",fontSize:".88rem",lineHeight:1.8,maxWidth:"360px",margin:"0 auto 1.5rem"}}>
              Two players enter. Only one leaves.<br/>
              Decode the enemy's credentials<br/>
              <span style={{color:"#ff2d6d"}}>before they decode yours.</span>
            </p>
          </div>
        )}

        {step>=3&&(
          <div style={{animation:"fadeInUp .5s ease both"}}>
            {/* Loading bar */}
            <div style={{width:"280px",height:"3px",background:"rgba(255,255,255,.06)",borderRadius:"2px",overflow:"hidden",margin:"0 auto .5rem"}}>
              <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#8b0000,#ff2d6d)",transition:"width .05s",boxShadow:"0 0 8px #ff2d6d"}}/>
            </div>
            <p style={{fontFamily:_mono,color:"#333",fontSize:".6rem",letterSpacing:".25em",marginBottom:"1.25rem"}}>
              INITIALISING... {pct}%
            </p>
            <p style={{fontFamily:_mono,color:"#ff2d6d44",fontSize:".55rem",letterSpacing:".3em",animation:"blink 1.5s ease infinite"}}>
              █ ENTERING FINAL ARENA █
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Instructions page ── */
function FinalBossInstructions({team,onStart}){
  const rules=[
    "Two players compete head-to-head in real time.",
    "Each player receives an encoded credential challenge.",
    "Your task: decode the opponent's username and password.",
    "The first player to correctly submit the credentials wins.",
    "If your opponent solves it first — you are eliminated.",
  ];
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem",position:"relative",zIndex:1}}>
      <div style={{width:"100%",maxWidth:"620px",animation:"fadeInUp .6s ease both"}}>

        {/* header */}
        <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
          <p style={{fontFamily:_mono,color:"#ff2d6d",fontSize:".6rem",letterSpacing:".5em",marginBottom:".6rem"}}>ROUND 04 · FINAL BOSS</p>
          <h1 style={{fontFamily:_han,fontSize:"clamp(1.8rem,5vw,2.8rem)",color:"#fff",letterSpacing:".06em",marginBottom:".4rem"}}>
            FINAL ROUND
          </h1>
          <h2 style={{fontFamily:_han,fontSize:"1.3rem",color:"#ff2d6d",letterSpacing:".15em"}}>
            PASSWORD WAR
          </h2>
          <div style={{height:"1px",background:"linear-gradient(90deg,transparent,rgba(255,45,109,.5),transparent)",marginTop:"1.25rem"}}/>
        </div>

        {/* rules card */}
        <div style={{
          background:"rgba(4,4,4,.98)",
          border:"1px solid rgba(255,45,109,.2)",
          borderRadius:"4px",
          padding:"2rem",
          marginBottom:"1.5rem",
          position:"relative",overflow:"hidden",
        }}>
          {/* accent bar */}
          <div style={{position:"absolute",top:0,left:0,width:"3px",height:"100%",background:"linear-gradient(180deg,#ff2d6d,transparent)"}}/>

          <p style={{fontFamily:_mono,color:"#ff2d6d",fontSize:".58rem",letterSpacing:".3em",marginBottom:"1.5rem"}}>
            ◈ &nbsp;RULES OF ENGAGEMENT
          </p>

          <div style={{display:"flex",flexDirection:"column",gap:".85rem",marginBottom:"2rem"}}>
            {rules.map((rule,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"1rem",animation:`fadeInUp .4s ${i*.08}s ease both`}}>
                <span style={{
                  fontFamily:_mono,color:"#ff2d6d",fontSize:".7rem",
                  minWidth:"22px",marginTop:"1px",flexShrink:0,
                  filter:"drop-shadow(0 0 6px #ff2d6d)",
                }}>
                  {["01","02","03","04","05"][i]}
                </span>
                <p style={{fontFamily:_serif,color:"#ccc",fontSize:".88rem",lineHeight:1.7}}>{rule}</p>
              </div>
            ))}
          </div>

          {/* credential hint box */}
          <div style={{
            padding:"1rem 1.25rem",
            background:"rgba(255,45,109,.05)",
            border:"1px solid rgba(255,45,109,.15)",
            borderRadius:"3px",
            display:"flex",alignItems:"flex-start",gap:".75rem",
          }}>
            <span style={{fontSize:"1.2rem",flexShrink:0,marginTop:"1px"}}>⚠</span>
            <p style={{fontFamily:_mono,color:"#555",fontSize:".68rem",letterSpacing:".06em",lineHeight:1.8}}>
              You will be asked to enter your <span style={{color:"#fff"}}>Player Name</span>, the opponent's <span style={{color:"#ff2d6d"}}>Username</span> and their <span style={{color:"#ff2d6d"}}>Password</span>. Decode them from the challenge brief you received.
            </p>
          </div>
        </div>

        {/* team info strip */}
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:".75rem 1.25rem",
          background:"rgba(255,255,255,.02)",
          border:"1px solid rgba(255,255,255,.05)",
          borderRadius:"3px",marginBottom:"1.5rem",
        }}>
          <span style={{fontFamily:_mono,color:"#333",fontSize:".6rem",letterSpacing:".1em"}}>
            TEAM: <span style={{color:"#fff"}}>{team.teamName}</span>
          </span>
          <span style={{fontFamily:_mono,color:"#333",fontSize:".6rem",letterSpacing:".1em"}}>
            ID: <span style={{color:"#ff2d6d"}}>#{team.teamId}</span>
          </span>
          <span style={{fontFamily:_mono,color:"#333",fontSize:".6rem",letterSpacing:".1em"}}>
            PLAYERS: <span style={{color:"#fff"}}>{team.players.length}</span>
          </span>
        </div>

        <button onClick={onStart} style={{
          width:"100%",padding:"1.1rem",
          background:"#ff2d6d",border:"none",borderRadius:"3px",
          color:"#000",fontFamily:_han,fontSize:"1.1rem",
          letterSpacing:".2em",cursor:"pointer",
          boxShadow:"0 0 40px rgba(255,45,109,.5)",
          animation:"glow 2s ease infinite",
        }}>
          START FINAL BATTLE ⚔
        </button>
      </div>
    </div>
  );
}

/* ── Credential submission form ── */
function FinalBossForm({team,onWin}){
  const [playerName,setPlayerName] = useState("");
  const [username,  setUsername]   = useState("");
  const [password,  setPassword]   = useState("");
  const [attempts,  setAttempts]   = useState(0);
  const [wrongMsg,  setWrongMsg]   = useState(false);
  const [shake,     setShake]      = useState(false);
  const [reveal,    setReveal]     = useState(false);
  const [cursorBlink,setCursor]    = useState(true);

  /* blinking cursor */
  useEffect(()=>{
    const iv=setInterval(()=>setCursor(c=>!c),530);
    return()=>clearInterval(iv);
  },[]);

  const { username: targetUsername, password: targetPassword } = buildFinalCredentials(team);

  const doSubmit=()=>{
    if(!playerName.trim()||!username.trim()||!password.trim()) return;
    setAttempts(a=>a+1);
    const enteredUser = username.trim();
    const enteredPwd = password.trim();

    const isCorrect =
      (enteredUser === targetUsername && enteredPwd === targetPassword) ||
      (enteredUser === PW_USERNAME && enteredPwd === PW_PASSWORD);

    if(isCorrect){
      onWin(playerName.trim());
    } else {
      setShake(true); setWrongMsg(true);
      setTimeout(()=>setShake(false),700);
    }
  };

  /* shared input row renderer */
  const TermInput=({label,prompt,value,onChange,type="text",placeholder})=>(
    <div style={{marginBottom:"1.25rem"}}>
      <p style={{fontFamily:_mono,color:"#444",fontSize:".58rem",
        letterSpacing:".25em",marginBottom:".5rem"}}>
        {label}
      </p>
      <div style={{
        display:"flex",alignItems:"center",gap:".5rem",
        background:"rgba(0,0,0,.97)",
        border:`1px solid ${wrongMsg&&type!=="text"?"rgba(255,45,109,.5)":"rgba(255,45,109,.2)"}`,
        borderRadius:"3px",padding:".7rem 1rem",
        transition:"border-color .2s",
      }}>
        <span style={{fontFamily:_mono,color:"#ff2d6d",fontSize:".75rem",flexShrink:0}}>{prompt}</span>
        <input
          type={type==="password"&&!reveal?"password":"text"}
          value={value}
          onChange={e=>{onChange(e.target.value);setWrongMsg(false);}}
          onKeyDown={e=>e.key==="Enter"&&doSubmit()}
          placeholder={placeholder}
          spellCheck={false} autoComplete="off"
          style={{
            flex:1,background:"transparent",border:"none",outline:"none",
            fontFamily:_mono,fontSize:".88rem",
            color:type==="password"?"#ff2d6d":"#00d4ff",
            letterSpacing:".05em",caretColor:"#ff2d6d",
          }}
        />
        {type==="password"&&(
          <button onClick={()=>setReveal(r=>!r)} style={{
            background:"none",border:"none",color:"#333",cursor:"pointer",
            fontFamily:_mono,fontSize:".58rem",flexShrink:0,letterSpacing:".05em",
          }}>
            {reveal?"HIDE":"SHOW"}
          </button>
        )}
        <span style={{
          width:"2px",height:"1em",background:"#ff2d6d",
          opacity:cursorBlink?0.7:0,flexShrink:0,transition:"opacity .05s",
        }}/>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"flex-start",
      justifyContent:"center",padding:"2rem 1.5rem",
      overflowY:"auto",position:"relative",zIndex:1}}>
      <div style={{width:"100%",maxWidth:"600px",
        animation:"fadeInUp .5s ease both",paddingTop:"2rem"}}>

        {/* ── Page header ── */}
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <p style={{fontFamily:_mono,color:"#ff2d6d",fontSize:".58rem",
            letterSpacing:".4em",marginBottom:".5rem"}}>
            ROUND 04 · FINAL BOSS · PASSWORD WAR
          </p>
          <h2 style={{fontFamily:_han,fontSize:"1.8rem",color:"#fff",
            letterSpacing:".08em",marginBottom:".25rem"}}>
            CREDENTIAL SUBMISSION
          </h2>
          <p style={{fontFamily:_mono,color:"#444",fontSize:".65rem",
            letterSpacing:".12em"}}>
            Decode your opponent's credentials and submit them first
          </p>
          <div style={{height:"1px",
            background:"linear-gradient(90deg,transparent,rgba(255,45,109,.3),transparent)",
            marginTop:"1.25rem"}}/>
        </div>

        {/* ── Terminal card ── */}
        <div style={{
          background:"rgba(2,2,2,.99)",
          border:`1px solid ${shake?"rgba(255,45,109,.75)":"rgba(255,45,109,.22)"}`,
          borderRadius:"4px",
          padding:"1.75rem 2rem",
          marginBottom:"1.25rem",
          animation:shake?"shake .5s ease":"none",
          transition:"border-color .3s",
          position:"relative",overflow:"hidden",
        }}>
          {/* left accent bar */}
          <div style={{position:"absolute",top:0,left:0,width:"3px",height:"100%",
            background:"linear-gradient(180deg,#ff2d6d,transparent)"}}/>

          {/* macOS traffic lights */}
          <div style={{display:"flex",alignItems:"center",gap:".5rem",marginBottom:"1.5rem"}}>
            <div style={{width:"9px",height:"9px",borderRadius:"50%",background:"#ff2d6d"}}/>
            <div style={{width:"9px",height:"9px",borderRadius:"50%",background:"#f59e0b"}}/>
            <div style={{width:"9px",height:"9px",borderRadius:"50%",background:"#00ff88"}}/>
            <span style={{fontFamily:_mono,color:"#222",fontSize:".58rem",
              marginLeft:".5rem",letterSpacing:".12em"}}>
              password-war.exe — final-boss
            </span>
          </div>

          {/* shell prompt */}
          <div style={{marginBottom:"1.75rem",
            padding:".75rem 1rem",
            background:"rgba(0,0,0,.6)",
            borderRadius:"3px",
            borderLeft:"2px solid rgba(255,45,109,.3)"}}>
            <p style={{fontFamily:_mono,color:"#00ff88",fontSize:".75rem",marginBottom:".25rem"}}>
              root@squid-arena:~$ ./crack_opponent
            </p>
            <p style={{fontFamily:_mono,color:"#333",fontSize:".65rem",letterSpacing:".06em"}}>
              Enter the credentials you have decoded from your opponent.
            </p>
          </div>

          {/* ── Field 1: Player Name ── */}
          <TermInput
            label="▸ YOUR PLAYER NAME"
            prompt="name›"
            value={playerName}
            onChange={setPlayerName}
            type="text"
            placeholder="enter your name..."
          />

          {/* ── Field 2: Opponent Username ── */}
          <TermInput
            label="▸ OPPONENT USERNAME"
            prompt="user›"
            value={username}
            onChange={setUsername}
            type="text"
            placeholder="decoded_username"
          />

          {/* ── Field 3: Opponent Password ── */}
          <TermInput
            label="▸ OPPONENT PASSWORD"
            prompt="pass›"
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="decoded_p4ssw0rd"
          />

          {/* ── Wrong feedback ── */}
          {wrongMsg&&(
            <div style={{
              padding:".8rem 1rem",
              background:"rgba(255,45,109,.07)",
              border:"1px solid rgba(255,45,109,.35)",
              borderRadius:"3px",marginBottom:"1.25rem",
              display:"flex",alignItems:"flex-start",gap:".75rem",
              animation:"fadeInUp .25s ease both",
            }}>
              <span style={{color:"#ff2d6d",fontSize:"1.1rem",flexShrink:0}}>✗</span>
              <div>
                <p style={{fontFamily:_han,color:"#ff2d6d",fontSize:".85rem",
                  letterSpacing:".05em",marginBottom:".2rem"}}>
                  Incorrect credentials.
                </p>
                <p style={{fontFamily:_mono,color:"#8b3a3a",fontSize:".68rem",
                  lineHeight:1.6}}>
                  Try again before your opponent wins.
                </p>
              </div>
            </div>
          )}

          {/* attempt counter */}
          {attempts>0&&!wrongMsg&&(
            <p style={{fontFamily:_mono,color:"#1e1e1e",fontSize:".58rem",
              letterSpacing:".12em",marginBottom:"1rem"}}>
              ATTEMPTS: {attempts}
            </p>
          )}

          {/* ── Submit button ── */}
          <button onClick={doSubmit} style={{
            width:"100%",padding:"1rem",
            background:"#ff2d6d",border:"none",borderRadius:"3px",
            color:"#000",fontFamily:_han,fontSize:"1rem",
            letterSpacing:".2em",cursor:"pointer",
            boxShadow:"0 0 28px rgba(255,45,109,.45)",
            transition:"all .2s",display:"flex",
            alignItems:"center",justifyContent:"center",gap:".75rem",
          }}>
            <span style={{fontSize:"1rem"}}>⚔</span>
            SUBMIT ↵
          </button>
        </div>

        {/* bottom flavour text */}
        <p style={{fontFamily:_mono,color:"#181818",fontSize:".58rem",
          letterSpacing:".15em",textAlign:"center"}}>
          RACE AGAINST YOUR OPPONENT · FIRST TO CRACK WINS
        </p>
      </div>
    </div>
  );
}

/* ── Win screen ── */
function FinalBossWin({team,playerName}){
  return(
    <div style={{
      minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      padding:"2rem",position:"relative",zIndex:1,
      background:"radial-gradient(circle at center,rgba(0,255,136,.05) 0%,transparent 70%)",
    }}>
      <div style={{textAlign:"center",animation:"fadeInUp .6s ease both",maxWidth:"540px"}}>

        {/* trophy */}
        <div style={{fontSize:"5rem",marginBottom:"1rem",animation:"honeyReveal .6s ease both",filter:"drop-shadow(0 0 30px #00ff88)"}}>🏆</div>

        <h1 style={{
          fontFamily:_han,fontSize:"clamp(2.5rem,8vw,4.5rem)",
          color:"#00ff88",letterSpacing:".08em",
          textShadow:"0 0 60px rgba(0,255,136,.6), 0 0 120px rgba(0,255,136,.3)",
          marginBottom:".5rem",
        }}>YOU WIN</h1>

        <p style={{
          fontFamily:_serif,color:"#ccc",fontSize:"1rem",
          lineHeight:1.8,marginBottom:"2rem",
        }}>
          You defeated your opponent in the final Squid Game round.
        </p>

        {/* terminal echo */}
        <div style={{
          padding:"1.25rem 1.5rem",
          background:"rgba(0,0,0,.98)",
          border:"1px solid rgba(0,255,136,.25)",
          borderRadius:"4px",marginBottom:"2rem",
          textAlign:"left",
        }}>
          <p style={{fontFamily:_mono,color:"#00ff88",fontSize:".7rem",letterSpacing:".2em",marginBottom:".75rem"}}>🏅 CYBER SQUID GAME CHAMPION</p>
          <div style={{fontFamily:_mono,fontSize:".8rem",lineHeight:2.0,color:"#555"}}>
            <p><span style={{color:"#444"}}>TEAM     ›</span> <span style={{color:"#fff"}}>{team.teamName}</span></p>
            <p><span style={{color:"#444"}}>ID       ›</span> <span style={{color:"#ff2d6d"}}>#{team.teamId}</span></p>
            <p><span style={{color:"#444"}}>PLAYER   ›</span> <span style={{color:"#00d4ff"}}>{playerName||team.players[0]||"UNKNOWN"}</span></p>
            <p><span style={{color:"#444"}}>STATUS   ›</span> <span style={{color:"#00ff88",animation:"pulse 1.5s ease infinite"}}>✓ SURVIVED ALL ROUNDS</span></p>
          </div>
        </div>

        {/* flag */}
        <div style={{
          padding:"1.25rem 2rem",
          background:"rgba(0,255,136,.04)",
          border:"1px solid rgba(0,255,136,.2)",
          borderRadius:"3px",marginBottom:"2rem",
          display:"inline-block",
        }}>
          <p style={{fontFamily:_han,fontSize:"1.6rem",color:"#00ff88",letterSpacing:".05em",
            textShadow:"0 0 20px rgba(0,255,136,.5)"}}>
            csqg&#123;y0u_surv1ved_th3_gam3&#125;
          </p>
        </div>

        <p style={{fontFamily:_mono,color:"#333",fontSize:".62rem",letterSpacing:".25em"}}>
          CONGRATULATIONS — THE PRIZE IS YOURS
        </p>
      </div>
    </div>
  );
}

/* ── Master FinalBoss controller ── */
function FinalBoss({team,onComplete}){
  const [phase,setPhase]           = useState("loading");
  const [winnerName,setWinnerName] = useState("");

  if(phase==="loading")      return <FinalBossLoading      onDone={()=>setPhase("instructions")}/>;
  if(phase==="instructions") return <FinalBossInstructions team={team} onStart={()=>setPhase("form")}/>;
  if(phase==="win")          return <FinalBossWin          team={team} playerName={winnerName} onComplete={onComplete}/>;

  return(
    <FinalBossForm
      team={team}
      onWin={(name)=>{setWinnerName(name);setPhase("win");}}
    />
  );
}

/* ═══════════════════════════════════════════════════════
   HOME PAGE — ROUND HUB
═══════════════════════════════════════════════════════ */
function HomePage({team,onLogout}){
  const [currentRound,setCurrentRound] = useState(() => {
    const saved = localStorage.getItem("cyberSquidCurrentRound");
    return saved ? Number(saved) : 0;
  });
  const [clearedRounds,setClearedRounds] = useState(() => {
    const saved = localStorage.getItem("cyberSquidClearedRounds");
    return saved ? JSON.parse(saved) : [];
  });
  const [elapsed,setElapsed]=useState(0);

  useEffect(()=>{
    const iv=setInterval(()=>setElapsed(e=>e+1),1000);
    return()=>clearInterval(iv);
  },[]);

  useEffect(()=>{
    localStorage.setItem("cyberSquidCurrentRound", String(currentRound));
  }, [currentRound]);

  useEffect(()=>{
    localStorage.setItem("cyberSquidClearedRounds", JSON.stringify(clearedRounds));
  }, [clearedRounds]);

  const fmt=(s)=>`${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const clearRound=(n)=>{
    if(!clearedRounds.includes(n)) setClearedRounds(r=>{
      const next = [...r,n];
      localStorage.setItem("cyberSquidClearedRounds", JSON.stringify(next));
      return next;
    });
    setCurrentRound(0);
  };

  const ROUND_DEFS=[
    {id:1,symbol:"▲",name:"ROUND 01",title:"RED LIGHT GREEN LIGHT",sub:"Pattern Recognition · Python",color:"#ff2d6d",lock:false},
    {id:2,symbol:"○",name:"ROUND 02",title:"HONEYCOMB",sub:"Machine Learning MCQ",color:"#00d4ff",lock:!clearedRounds.includes(1)},
    {id:3,symbol:"🪢",name:"ROUND 03",title:"TUG OF WAR",sub:"Coding & Networking",color:"#f59e0b",lock:!clearedRounds.includes(2)},
    {id:4,symbol:"🦑",name:"FINAL BOSS",title:"SQUID GAME MASTER",sub:"Cybersecurity Battle",color:"#a855f7",lock:!clearedRounds.includes(3)},
  ];

  if(currentRound===1) return <><FloatingShapes/><Round1Game onComplete={(score)=>clearRound(1)}/></>;
  if(currentRound===2) return <><FloatingShapes/><Round2Game onComplete={()=>clearRound(2)}/></>;
  if(currentRound===3) return <><FloatingShapes/><Round3Game onComplete={()=>clearRound(3)}/></>;
  if(currentRound===4) return <><FloatingShapes/><FinalBoss team={team} onComplete={()=>clearRound(4)}/></>;

  return(
    <div style={{minHeight:"100vh",position:"relative",zIndex:1}}>
      {/* Header */}
      <header style={{position:"sticky",top:0,zIndex:100,background:"rgba(0,0,0,.96)",borderBottom:"1px solid rgba(255,45,109,.15)",padding:".75rem 2rem",display:"flex",alignItems:"center",justifyContent:"space-between",backdropFilter:"blur(20px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
          <span style={{fontSize:"1.2rem",color:"#ff2d6d"}}>▲○■</span>
          <div>
            <p style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"1rem",color:"#ff2d6d",letterSpacing:".1em"}}>CYBER SQUID GAME</p>
            <p style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".55rem",color:"#333",letterSpacing:".1em"}}>CTF CHALLENGE</p>
          </div>
        </div>
        <div style={{display:"flex",gap:"2rem",alignItems:"center"}}>
          <div style={{textAlign:"center"}}><p style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".55rem",color:"#333",letterSpacing:".15em"}}>TIME</p><p style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:".95rem",color:"#ff2d6d"}}>{fmt(elapsed)}</p></div>
          <div style={{textAlign:"center"}}><p style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".55rem",color:"#333",letterSpacing:".15em"}}>TEAM</p><p style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:".95rem",color:"#fff"}}>{team.teamName}</p></div>
          <div style={{textAlign:"center"}}><p style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".55rem",color:"#333",letterSpacing:".15em"}}>CLEARED</p><p style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:".95rem",color:"#00ff88"}}>{clearedRounds.length}/4</p></div>
          <button onClick={onLogout} style={{background:"none",border:"1px solid rgba(255,45,109,.3)",color:"#ff2d6d",padding:".35rem .9rem",fontFamily:"'Share Tech Mono',monospace",fontSize:".6rem",cursor:"pointer",letterSpacing:".1em"}}>EXIT</button>
        </div>
      </header>

      {/* Hero */}
      <div style={{textAlign:"center",padding:"3rem 2rem 2rem",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
        <p style={{fontFamily:"'Share Tech Mono',monospace",color:"#ff2d6d",fontSize:".7rem",letterSpacing:".4em",marginBottom:".5rem"}}>WELCOME, PLAYER {team.teamId}</p>
        <h1 style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"clamp(2rem,6vw,3.5rem)",color:"#fff",letterSpacing:".05em",textShadow:"0 0 40px rgba(255,45,109,.3)"}}>THE GAME BEGINS</h1>
        <p style={{fontFamily:"'Share Tech Mono',monospace",color:"#333",marginTop:".6rem",fontSize:".7rem"}}>
          {team.players.join(" · ")}
        </p>

        {/* Progress bar */}
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:".5rem",marginTop:"1.5rem"}}>
          {ROUND_DEFS.map((r,i)=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:".5rem"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:".3rem"}}>
                <div style={{width:"16px",height:"16px",background:clearedRounds.includes(r.id)?r.color:"transparent",border:`2px solid ${clearedRounds.includes(r.id)?r.color:r.lock?"#222":"rgba(255,255,255,.2)"}`,borderRadius:r.id===2?"50%":r.id===1?"0%":"0",boxShadow:clearedRounds.includes(r.id)?`0 0 10px ${r.color}`:"none",transition:"all .3s"}}/>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".5rem",color:clearedRounds.includes(r.id)?r.color:"#333",letterSpacing:".1em"}}>{clearedRounds.includes(r.id)?"✓":r.lock?"🔒":"●"}</span>
              </div>
              {i<ROUND_DEFS.length-1&&<div style={{width:"40px",height:"1px",background:clearedRounds.includes(r.id)?"rgba(255,255,255,.2)":"rgba(255,255,255,.06)",transition:"background .5s"}}/>}
            </div>
          ))}
        </div>
      </div>

      {/* Round Cards */}
      <div style={{maxWidth:"900px",margin:"0 auto",padding:"2.5rem 1.5rem",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"1.25rem"}}>
        {ROUND_DEFS.map((r,i)=>{
          const cleared=clearedRounds.includes(r.id);
          return(
            <div key={r.id} onClick={()=>!r.lock&&setCurrentRound(r.id)} style={{position:"relative",background:cleared?"rgba(8,8,8,.8)":r.lock?"rgba(4,4,4,.9)":"rgba(8,8,8,.97)",border:`1px solid ${cleared?"rgba(0,255,136,.25)":r.lock?"rgba(255,255,255,.04)":`${r.color}33`}`,borderRadius:"4px",padding:"1.75rem",cursor:r.lock?"not-allowed":"pointer",opacity:r.lock?.5:1,transition:"all .3s",animation:`fadeInUp .5s ${i*.1}s ease both`,boxShadow:cleared?`0 0 20px rgba(0,255,136,.06)`:(!r.lock&&!cleared)?`0 0 30px ${r.color}11`:"none"}}>
              <div style={{position:"absolute",top:"1rem",right:"1rem"}}>
                {cleared&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".6rem",color:"#00ff88",border:"1px solid rgba(0,255,136,.3)",padding:"2px 8px"}}>✓ CLEARED</span>}
                {r.lock&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".6rem",color:"#333",border:"1px solid #111",padding:"2px 8px"}}>LOCKED</span>}
                {!cleared&&!r.lock&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".6rem",color:r.color,border:`1px solid ${r.color}`,padding:"2px 8px",animation:"pulse 1.2s ease infinite"}}>● AVAILABLE</span>}
              </div>
              <div style={{fontSize:"2.8rem",color:cleared?"#00ff88":r.lock?"#222":r.color,filter:(!r.lock&&!cleared)?`drop-shadow(0 0 12px ${r.color})`:"none",marginBottom:"1rem"}}>{cleared?"✓":r.symbol}</div>
              <p style={{fontFamily:"'Share Tech Mono',monospace",color:"#444",fontSize:".6rem",letterSpacing:".2em",marginBottom:".3rem"}}>{r.name}</p>
              <h3 style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"1.2rem",color:cleared?"#555":r.lock?"#222":"#fff",letterSpacing:".05em",marginBottom:".4rem"}}>{r.title}</h3>
              <p style={{fontFamily:"'Share Tech Mono',monospace",color:cleared?"#333":r.lock?"#222":r.color,fontSize:".68rem",opacity:r.lock?.4:1}}>{r.sub}</p>
              {!r.lock&&!cleared&&<div style={{marginTop:"1.25rem",padding:".6rem 1rem",background:r.color,borderRadius:"2px",textAlign:"center",fontFamily:"'Black Han Sans',sans-serif",fontSize:".75rem",color:"#000",letterSpacing:".15em"}}>ENTER →</div>}
              {r.lock&&<div style={{marginTop:"1.25rem",padding:".6rem 1rem",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.05)",borderRadius:"2px",textAlign:"center",fontFamily:"'Share Tech Mono',monospace",fontSize:".65rem",color:"#222",letterSpacing:".1em"}}>COMPLETE PREV ROUND</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════ */
export default function App(){
  const [team,setTeam] = useState(() => {
    try {
      const saved = localStorage.getItem("cyberSquidTeam");
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (team) {
        localStorage.setItem("cyberSquidTeam", JSON.stringify(team));
      } else {
        localStorage.removeItem("cyberSquidTeam");
      }
    } catch (err) {
      console.warn("Could not persist team", err);
    }
  }, [team]);

  return(
    <>
      <GlobalStyles/>
      <FloatingShapes/>
      <div style={{position:"fixed",top:"30%",left:"50%",transform:"translateX(-50%)",width:"700px",height:"700px",background:"radial-gradient(circle,rgba(255,45,109,.03) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      {team?<HomePage team={team} onLogout={()=>setTeam(null)}/>:<LoginPage onLogin={setTeam}/>}

    </>
  );
}
