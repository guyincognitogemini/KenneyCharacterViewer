import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import { Box, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Paper, useTheme, useMediaQuery } from '@mui/material';

const modelFiles = [
  'character-a', 'character-b', 'character-c', 'character-d', 'character-e',
  'character-f', 'character-g', 'character-h', 'character-i', 'character-j',
  'character-k', 'character-l', 'character-m', 'character-n', 'character-o',
  'character-p', 'character-q', 'character-r'
];

function Model({ modelName, animationName, onAnimationsLoaded, turntable, isInteracting }) {
  const { scene, animations } = useGLTF(`models-draco/${modelName}.glb`, true);
  const { actions, names } = useAnimations(animations, scene);

  useEffect(() => {
    onAnimationsLoaded(names);
  }, [names, onAnimationsLoaded]);

  useEffect(() => {
    Object.values(actions).forEach(action => action.stop());
    if (animationName && actions[animationName]) {
      actions[animationName].play();
    }
  }, [animationName, actions]);

  useFrame((state, delta) => {
    if (turntable && !isInteracting) {
      scene.rotation.y += delta * 0.5;
    }
  });

  return <primitive object={scene} />;
}

function Controls({
  selectedModel,
  handleModelChange,
  animations,
  selectedAnimation,
  handleAnimationChange,
  turntable,
  setTurntable,
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  if (isDesktop) {
    return (
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          zIndex: 10,
          top: 16,
          left: 16,
          width: 300,
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="model-select-label">Character</InputLabel>
          <Select
            labelId="model-select-label"
            value={selectedModel}
            label="Character"
            onChange={handleModelChange}
          >
            {modelFiles.map(modelName => (
              <MenuItem key={modelName} value={modelName}>{modelName}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {animations.length > 0 && (
          <FormControl fullWidth>
            <InputLabel id="animation-select-label">Animation</InputLabel>
            <Select
              labelId="animation-select-label"
              value={selectedAnimation}
              label="Animation"
              onChange={handleAnimationChange}
            >
              {animations.map(name => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <FormControlLabel
          control={<Switch checked={turntable} onChange={(e) => setTurntable(e.target.checked)} />}
          label="Turntable"
        />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        zIndex: 10,
        bottom: 0,
        left: 0,
        right: 0,
        padding: 1,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderTop: '1px solid #ddd',
      }}
    >
      <FormControl variant="standard" sx={{ minWidth: 120 }}>
        <InputLabel id="model-select-label-mobile">Character</InputLabel>
        <Select
          labelId="model-select-label-mobile"
          value={selectedModel}
          onChange={handleModelChange}
        >
          {modelFiles.map(modelName => (
            <MenuItem key={modelName} value={modelName}>{modelName}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {animations.length > 0 && (
        <FormControl variant="standard" sx={{ minWidth: 120 }}>
          <InputLabel id="animation-select-label-mobile">Animation</InputLabel>
          <Select
            labelId="animation-select-label-mobile"
            value={selectedAnimation}
            onChange={handleAnimationChange}
          >
            {animations.map(name => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <FormControlLabel
        control={<Switch checked={turntable} onChange={(e) => setTurntable(e.target.checked)} size="small" />}
        label="Turntable"
        sx={{ mr: 0 }}
      />
    </Paper>
  );
}


function App() {
  const [selectedModel, setSelectedModel] = useState(modelFiles[0]);
  const [animations, setAnimations] = useState([]);
  const [selectedAnimation, setSelectedAnimation] = useState('');
  const [turntable, setTurntable] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const controlsRef = useRef();

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
    setAnimations([]);
    setSelectedAnimation('');
  };

  const handleAnimationChange = (event) => {
    setSelectedAnimation(event.target.value);
  };

  const handleAnimationsLoaded = useCallback((animationNames) => {
    setAnimations(animationNames);
    if (animationNames.length > 0 && !selectedAnimation) {
      setSelectedAnimation(animationNames[0]);
    }
  }, [selectedAnimation]);

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

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <Controls
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        animations={animations}
        selectedAnimation={selectedAnimation}
        handleAnimationChange={handleAnimationChange}
        turntable={turntable}
        setTurntable={setTurntable}
      />
      <Canvas
        frameloop={selectedAnimation || turntable ? 'always' : 'demand'}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model
            modelName={selectedModel}
            animationName={selectedAnimation}
            onAnimationsLoaded={handleAnimationsLoaded}
            turntable={turntable}
            isInteracting={isInteracting}
          />
        </Suspense>
        <OrbitControls ref={controlsRef} />
      </Canvas>
    </Box>
  );
}

export default App;