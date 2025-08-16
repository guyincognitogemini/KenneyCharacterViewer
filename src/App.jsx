import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import { Box, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';

const modelFiles = [
  'character-a', 'character-b', 'character-c', 'character-d', 'character-e',
  'character-f', 'character-g', 'character-h', 'character-i', 'character-j',
  'character-k', 'character-l', 'character-m', 'character-n', 'character-o',
  'character-p', 'character-q', 'character-r'
];

function Model({ modelName, animationName, onAnimationsLoaded, turntable, isInteracting }) {
  const { scene, animations } = useGLTF(`/models-draco/${modelName}.glb`, true);
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
    if (animationNames.length > 0) {
      setSelectedAnimation(animationNames[0]);
    }
  }, []);

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
      <Box
        sx={{
          position: 'absolute',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.8)',
          padding: 2,
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          // Mobile-first styles
          bottom: 16,
          left: 16,
          right: 16,
          // Desktop styles
          '@media (min-width:600px)': {
            top: 16,
            bottom: 'auto',
            left: 16,
            right: 'auto',
            width: '300px',
          },
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="model-select-label">Character</InputLabel>
          <Select
            labelId="model-select-label"
            id="model-select"
            value={selectedModel}
            label="Character"
            onChange={handleModelChange}
          >
            {modelFiles.map(modelName => (
              <MenuItem key={modelName} value={modelName}>
                {modelName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {animations.length > 0 && (
          <FormControl fullWidth>
            <InputLabel id="animation-select-label">Animation</InputLabel>
            <Select
              labelId="animation-select-label"
              id="animation-select"
              value={selectedAnimation}
              label="Animation"
              onChange={handleAnimationChange}
            >
              {animations.map(name => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <FormControlLabel
          control={<Switch checked={turntable} onChange={(e) => setTurntable(e.target.checked)} />}
          label="Turntable"
        />
      </Box>
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