import React, { Suspense, useState, useEffect, useCallback, useRef, useMemo, createContext, useContext } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import {
  Box, FormControl, InputLabel, Select, MenuItem, Paper, useMediaQuery,
  IconButton, Menu, ListItemIcon, ListItemText, Divider, Tooltip, createTheme, ThemeProvider, useTheme
} from '@mui/material';
import {
  PlayArrow, Pause, MoreVert, Replay, CameraAlt, Rotate90DegreesCcw, WbSunny, Brightness4, Brightness7
} from '@mui/icons-material';

// --- THEME & CONTEXT SETUP ---
const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'dark' ? {
      background: { default: '#303030', paper: 'rgba(40, 40, 40, 0.85)' },
      text: { primary: '#fff' }
    } : {
      background: { default: '#f4f4f4', paper: 'rgba(255, 255, 255, 0.9)' },
      text: { primary: '#000' }
    }),
  },
});

const ThemeContext = createContext();
const useThemeContext = () => useContext(ThemeContext);

// --- DATA & CONSTANTS ---
const modelFiles = [
  'character-a', 'character-b', 'character-c', 'character-d', 'character-e',
  'character-f', 'character-g', 'character-h', 'character-i', 'character-j',
  'character-k', 'character-l', 'character-m', 'character-n', 'character-o',
  'character-p', 'character-q', 'character-r'
];

const lightingPresets = {
  studio: { name: 'Studio', icon: <WbSunny fontSize="small" /> },
  sunrise: { name: 'Sunrise', icon: <Brightness4 fontSize="small" /> },
};

// --- 3D COMPONENTS ---
function SceneLighting({ preset }) {
  switch (preset) {
    case 'sunrise':
      return <>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 2, 5]} intensity={2} color="#ffdab9" />
        <directionalLight position={[-10, 2, -5]} intensity={1} color="#4682b4" />
      </>;
    case 'studio':
    default:
      return <>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} />
      </>;
  }
}

function Model({ modelName, animationName, onAnimationsLoaded, turntable, isInteracting, isPlaying }) {
  const { scene, animations } = useGLTF(`models-draco/${modelName}.glb`, true);
  const { actions, names } = useAnimations(animations, scene);

  useEffect(() => { onAnimationsLoaded(names); }, [names, onAnimationsLoaded]);

  useEffect(() => {
    Object.values(actions).forEach(action => action.stop());
    const action = actions[animationName];
    if (action) {
      if (isPlaying) action.play();
      else action.stop();
    }
  }, [animationName, actions, isPlaying]);

  useFrame((state, delta) => {
    if (turntable && !isInteracting) scene.rotation.y += delta * 0.5;
  });

  return <primitive object={scene} />;
}

// --- UI COMPONENT ---
function Controls({
  isDockVisible, selectedModel, handleModelChange, animations, selectedAnimation, handleAnimationChange,
  turntable, setTurntable, isPlaying, handlePlayPause, handleResetCamera, handleScreenshot,
  lightingPreset, handleLightingChange
}) {
  const isDesktop = useMediaQuery('(min-width:900px)');
  const { themeMode, handleThemeChange } = useThemeContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const sharedMenuItems = (
    <>
      <MenuItem onClick={() => { setTurntable(!turntable); handleMenuClose(); }}>
        <ListItemIcon><Rotate90DegreesCcw fontSize="small" /></ListItemIcon>
        <ListItemText>{turntable ? 'Stop Turntable' : 'Start Turntable'}</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => { handleLightingChange(); handleMenuClose(); }}>
        <ListItemIcon>{lightingPresets[lightingPreset].icon}</ListItemIcon>
        <ListItemText>Light: {lightingPresets[lightingPreset].name}</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => { handleThemeChange(); handleMenuClose(); }}>
        <ListItemIcon>{themeMode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}</ListItemIcon>
        <ListItemText>{themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => { handleScreenshot(); handleMenuClose(); }}>
        <ListItemIcon><CameraAlt fontSize="small" /></ListItemIcon>
        <ListItemText>Screenshot</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => { handleResetCamera(); handleMenuClose(); }}>
        <ListItemIcon><Replay fontSize="small" /></ListItemIcon>
        <ListItemText>Reset Camera</ListItemText>
      </MenuItem>
    </>
  );

  if (isDesktop) {
    return (
      <Paper
        elevation={4}
        sx={{
          position: 'absolute', zIndex: 10, bottom: 16, right: 16,
          display: 'flex', alignItems: 'center', gap: 1,
          bgcolor: 'background.paper', color: 'text.primary',
          padding: '4px 8px', borderRadius: '16px',
          opacity: isDockVisible ? 1 : 0,
          transform: isDockVisible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 300ms ease-in-out, transform 300ms ease-in-out',
        }}
      >
        <FormControl variant="standard" sx={{ minWidth: 130 }}>
          <InputLabel>Character</InputLabel>
          <Select value={selectedModel} onChange={handleModelChange}>
            {modelFiles.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
          </Select>
        </FormControl>
        {animations.length > 0 && (
          <FormControl variant="standard" sx={{ minWidth: 130 }}>
            <InputLabel>Animation</InputLabel>
            <Select value={selectedAnimation} onChange={handleAnimationChange}>
              {animations.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
            </Select>
          </FormControl>
        )}
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <Tooltip title={isPlaying ? "Pause (Space)" : "Play (Space)"}>
          <IconButton onClick={handlePlayPause} color="inherit" disabled={!selectedAnimation}>
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset Camera (R)">
          <IconButton onClick={handleResetCamera} color="inherit"><Replay /></IconButton>
        </Tooltip>
        <IconButton onClick={handleMenuClick} color="inherit"><MoreVert /></IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>{sharedMenuItems}</Menu>
      </Paper>
    );
  }

  // Mobile/Tablet View
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute', zIndex: 10, bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        height: '56px', padding: '0 8px', bgcolor: 'background.paper', color: 'text.primary',
      }}
    >
      <FormControl variant="standard" sx={{ minWidth: 120 }}>
        <InputLabel>Character</InputLabel>
        <Select value={selectedModel} onChange={handleModelChange}>
          {modelFiles.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
        </Select>
      </FormControl>
      {animations.length > 0 && (
        <IconButton onClick={handlePlayPause} color="inherit" disabled={!selectedAnimation}>
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
      )}
      <IconButton onClick={handleMenuClick} color="inherit"><MoreVert /></IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        {animations.length > 0 && (
          <MenuItem><FormControl variant="standard" sx={{ minWidth: 150 }}>
            <InputLabel>Animation</InputLabel>
            <Select value={selectedAnimation} onChange={handleAnimationChange}>
              {animations.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
            </Select>
          </FormControl></MenuItem>
        )}
        {sharedMenuItems}
      </Menu>
    </Paper>
  );
}

// --- MAIN APP LOGIC COMPONENT ---
function AppContent() {
  const [selectedModel, setSelectedModel] = useState(modelFiles[0]);
  const [animations, setAnimations] = useState([]);
  const [selectedAnimation, setSelectedAnimation] = useState('');
  const [turntable, setTurntable] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [lightingPreset, setLightingPreset] = useState('studio');
  const [isDockVisible, setIsDockVisible] = useState(true);
  const controlsRef = useRef();
  const canvasRef = useRef();
  const activityTimer = useRef();
  const theme = useTheme();

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
    setAnimations([]);
    setSelectedAnimation('');
    setIsPlaying(true);
  };

  const handleAnimationChange = (event) => {
    setSelectedAnimation(event.target.value);
    setIsPlaying(true);
  };

  const handleAnimationsLoaded = useCallback((animationNames) => {
    setAnimations(animationNames);
    if (animationNames.length > 0 && !animationNames.includes(selectedAnimation)) {
      setSelectedAnimation(animationNames[0]);
    }
  }, [selectedAnimation]);

  const handlePlayPause = useCallback(() => {
    if (selectedAnimation) setIsPlaying(prev => !prev);
  }, [selectedAnimation]);

  const handleResetCamera = useCallback(() => controlsRef.current?.reset(), []);

  const handleScreenshot = () => {
    const link = document.createElement('a');
    link.setAttribute('download', `${selectedModel}-screenshot.png`);
    link.setAttribute('href', canvasRef.current.toDataURL('image/png').replace('image/png', 'image/octet-stream'));
    link.click();
  };

  const handleLightingChange = () => {
    const presets = Object.keys(lightingPresets);
    const currentIndex = presets.indexOf(lightingPreset);
    setLightingPreset(presets[(currentIndex + 1) % presets.length]);
  };

  const handleActivity = () => {
    setIsDockVisible(true);
    clearTimeout(activityTimer.current);
    activityTimer.current = setTimeout(() => setIsDockVisible(false), 3000);
  };

  useEffect(() => {
    const controls = controlsRef.current;
    if (controls) {
      const start = () => setIsInteracting(true);
      const end = () => setIsInteracting(false);
      controls.addEventListener('start', start);
      controls.addEventListener('end', end);
      return () => {
        controls.removeEventListener('start', start);
        controls.removeEventListener('end', end);
      };
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space') { event.preventDefault(); handlePlayPause(); }
      if (event.code === 'KeyR') { event.preventDefault(); handleResetCamera(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, handleResetCamera]);

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative', bgcolor: 'background.default' }} onMouseMove={handleActivity} onTouchStart={handleActivity}>
      <Controls
        isDockVisible={isDockVisible}
        selectedModel={selectedModel} handleModelChange={handleModelChange}
        animations={animations} selectedAnimation={selectedAnimation} handleAnimationChange={handleAnimationChange}
        turntable={turntable} setTurntable={setTurntable}
        isPlaying={isPlaying} handlePlayPause={handlePlayPause}
        handleResetCamera={handleResetCamera} handleScreenshot={handleScreenshot}
        lightingPreset={lightingPreset} handleLightingChange={handleLightingChange}
      />
      <Canvas
        ref={canvasRef}
        gl={{ preserveDrawingBuffer: true }}
        frameloop={selectedAnimation && isPlaying || turntable ? 'always' : 'demand'}
        dpr={[1, 2]}
      >
        <color attach="background" args={[theme.palette.background.default]} />
        <SceneLighting preset={lightingPreset} />
        <Suspense fallback={null}>
          <Model
            modelName={selectedModel} animationName={selectedAnimation}
            onAnimationsLoaded={handleAnimationsLoaded} turntable={turntable}
            isInteracting={isInteracting} isPlaying={isPlaying}
          />
        </Suspense>
        <OrbitControls ref={controlsRef} />
      </Canvas>
    </Box>
  );
}

// --- APP WRAPPER ---
export default function App() {
  const [themeMode, setThemeMode] = useState('light');
  const handleThemeChange = () => setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, handleThemeChange }}>
      <ThemeProvider theme={theme}>
        <AppContent />
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}