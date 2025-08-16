# 3D Character Viewer

This project is a web-based 3D character viewer built to display and animate a collection of character models. It provides an interactive interface to easily switch between different models and their respective animations.

The application is built using modern web technologies, including React, Vite, and Three.js, with a polished user interface provided by Material-UI.

## Features

- **Dynamic Model Loading**: Load and display `.glb` 3D models from a local directory.
- **Model Selection**: A dropdown menu allows you to seamlessly switch between 18 different character models.
- **Animation Support**: Automatically detects and lists all animations embedded within a model file.
- **Animation Control**: A second dropdown allows you to select and play any of the available animations for the current model.
- **Interactive 3D Scene**:
  - **Orbit Controls**: Rotate, pan, and zoom the camera to view the character from any angle.
  - **Basic Lighting**: The scene is lit with both ambient and directional lights to ensure the model is clearly visible.
- **Modern UI**: The user interface is built with Material-UI for a clean, responsive, and professional look.

## Tech Stack

- **Frontend Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **3D Rendering**: [Three.js](https://threejs.org/)
- **React Renderer for Three.js**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **Three.js Helpers for R3F**: [Drei](https://github.com/pmndrs/drei)
- **UI Library**: [Material-UI (MUI)](https://mui.com/)

## Project Structure

```
character-viewer/
├── public/
│   └── models/         # Contains all the .glb 3D models
├── src/
│   ├── App.jsx         # Main application component
│   └── index.css       # Global styles for the application
├── package.json        # Project dependencies and scripts
└── vite.config.js      # Vite configuration
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1.  **Clone the repository (or navigate to the project directory):**
    ```bash
    cd character-viewer
    ```

2.  **Install the dependencies:**
    ```bash
    npm install
    ```

### Running the Application

To start the local development server, run the following command:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

## How It Works

The application's core logic resides in the `src/App.jsx` component.

1.  **State Management**: The `App` component uses React's `useState` hook to manage the currently selected model and animation.
2.  **UI Controls**: Material-UI components (`Select`, `MenuItem`, etc.) are used to create the dropdown menus. When a user selects a new model or animation, the corresponding state is updated.
3.  **3D Canvas**: The `Canvas` component from React Three Fiber creates the WebGL canvas where the 3D scene is rendered.
4.  **Model Loading**: The `Model` component is responsible for loading the 3D asset. It uses the `useGLTF` hook from Drei, which leverages `Suspense` to handle the asynchronous loading of the `.glb` file.
5.  **Animation Handling**: The `useAnimations` hook from Drei extracts all animation clips from the loaded model. The `App` component receives the list of animation names and populates the animation dropdown. When an animation is selected, its action is triggered via the `play()` method.