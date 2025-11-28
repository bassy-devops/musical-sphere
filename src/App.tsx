import { useState } from 'react';
import { Scene } from './components/Scene';
import { audioEngine, SONGS } from './audio/AudioEngine';
import { useStore } from './store/useStore';

function App() {
  const [started, setStarted] = useState(false);
  const { isRecording, setIsRecording } = useStore();

  const handleStart = async () => {
    await audioEngine.start();
    setStarted(true);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      const blob = await audioEngine.stopRecording();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-tune.webm';
      a.click();
      setIsRecording(false);
    } else {
      audioEngine.startRecording();
      setIsRecording(true);
    }
  };

  const playSong = (songKey: keyof typeof SONGS) => {
    audioEngine.playMelody(SONGS[songKey]);
  };

  if (!started) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#111',
        color: 'white',
        fontFamily: 'sans-serif',
        padding: '20px'
      }}>
        <button
          onClick={handleStart}
          style={{
            padding: 'clamp(15px, 4vw, 20px) clamp(30px, 8vw, 40px)',
            fontSize: 'clamp(18px, 5vw, 24px)',
            borderRadius: '50px',
            border: 'none',
            background: 'linear-gradient(45deg, #ff00cc, #3333ff)',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(255,0,204,0.5)',
            minHeight: '44px',
            minWidth: '120px'
          }}
        >
          Start Playing
        </button>
      </div>
    );
  }

  const btnStyle = {
    padding: 'clamp(8px, 2vw, 10px) clamp(15px, 4vw, 20px)',
    borderRadius: '20px',
    border: 'none',
    color: 'white',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
    fontSize: 'clamp(12px, 3vw, 14px)',
    minHeight: '44px',
    minWidth: '80px',
    touchAction: 'manipulation' as const
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Scene />

      {/* Main controls - bottom center */}
      <div style={{
        position: 'absolute',
        bottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'clamp(10px, 3vw, 20px)',
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
        maxWidth: '100%'
      }}>
        <button onClick={() => playSong('twinkle')} style={{ ...btnStyle, background: '#FFD700', color: 'black' }}>
          ⭐ Twinkle
        </button>

        <button
          onClick={toggleRecording}
          style={{
            padding: 'clamp(15px, 4vw, 20px) clamp(20px, 5vw, 30px)',
            borderRadius: '40px',
            border: '3px solid white',
            background: isRecording ? '#ff4444' : 'transparent',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(255,255,255,0.3)',
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            minHeight: '44px',
            minWidth: '80px',
            touchAction: 'manipulation'
          }}
        >
          {isRecording ? '⏹ STOP' : '⏺ REC'}
        </button>

        <button onClick={() => playSong('ode')} style={{ ...btnStyle, background: '#32CD32' }}>
          🎵 Ode
        </button>
      </div>



      {/* Instructions - top left */}
      <div style={{
        position: 'absolute',
        top: 'max(20px, env(safe-area-inset-top, 20px))',
        left: '20px',
        color: 'white',
        fontFamily: 'sans-serif',
        pointerEvents: 'none',
        opacity: 0.7,
        fontSize: 'clamp(10px, 2.5vw, 14px)',
        maxWidth: '200px'
      }}>
        <p style={{ margin: 0 }}>📱 Tap & Hold to play</p>
      </div>
      {/* Background Switcher - Top Center */}
      <div style={{
        position: 'absolute',
        top: 'max(20px, env(safe-area-inset-top, 20px))',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        background: 'rgba(0,0,0,0.5)',
        padding: '8px',
        borderRadius: '20px',
        zIndex: 10
      }}>
        <button
          onClick={() => useStore.getState().setBackgroundMode('default')}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            opacity: useStore.getState().backgroundMode === 'default' ? 1 : 0.5,
            padding: '0 5px'
          }}
        >
          ⬛
        </button>
        <button
          onClick={() => useStore.getState().setBackgroundMode('camera')}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            opacity: useStore.getState().backgroundMode === 'camera' ? 1 : 0.5,
            padding: '0 5px'
          }}
        >
          📷
        </button>
        <button
          onClick={() => useStore.getState().setBackgroundMode('beautiful')}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            opacity: useStore.getState().backgroundMode === 'beautiful' ? 1 : 0.5,
            padding: '0 5px'
          }}
        >
          ✨
        </button>
      </div>
    </div>
  );
}

export default App;
