# Optimizing the 3D Character Viewer for Mobile Devices

Optimizing a 3D web application for mobile is crucial for delivering a smooth and responsive user experience. Mobile devices have varying performance capabilities and different interaction patterns (touch) compared to desktops. This guide outlines key areas for optimizing the character viewer.

## 1. Performance Optimization

Performance is the most significant challenge on mobile. High-resolution models and complex scenes can quickly drain battery and lead to low frame rates.

### Model and Texture Compression

- **Draco Compression**: The `.glb` format can be further compressed using [Google's Draco library](https://github.com/google/draco). This significantly reduces the file size of the models, leading to faster loading times, which is especially important on slower mobile networks.
  - **How to implement**: Use a tool like `gltf-pipeline` to apply Draco compression to your existing `.glb` files. The `useGLTF` hook in Drei automatically handles Draco-compressed models if you provide the necessary decoder path.

- **Texture Optimization**: Large textures are a major source of memory consumption.
  - **Resize**: Ensure textures are no larger than necessary. A 2K (2048x2048) texture is often sufficient for high-quality assets, and 1K (1024x1024) is usually a good target for mobile performance.
  - **Format**: Use modern, web-friendly formats like WebP, which offers excellent compression with good quality.

### Level of Detail (LODs)

For more complex scenes (or models), you can implement Level of Detail (LOD). This technique involves showing a lower-polygon, simpler version of the model when it's far from the camera and switching to the high-quality version as the camera gets closer. The `LOD` helper in Drei can simplify this process.

### Rendering Quality

- **Device Pixel Ratio (DPR)**: High-resolution mobile screens have a high device pixel ratio, which can be demanding to render. You can balance performance and visual quality by clamping the DPR.
  - **How to implement**: In the `<Canvas>` component, set the `dpr` prop. A value of `[1, 2]` means the DPR will be at most 2, preventing excessive rendering load on very high-res screens.
    ```jsx
    <Canvas dpr={[1, 2]}>
      {/* ... your scene ... */}
    </Canvas>
    ```

## 2. UI/UX and Responsiveness

The user interface must be adapted for smaller screens and touch input.

### Responsive Controls

The current control panel is in the top-left corner. On mobile, it's often better to place primary controls at the bottom of the screen for easier reach with a thumb.

- **How to implement**: Use Material-UI's responsive styling capabilities within the `sx` prop. You can define different styles for different screen sizes (breakpoints).

  ```jsx
  <Box
    sx={{
      position: 'absolute',
      // Default styles (mobile-first)
      bottom: 16,
      left: 16,
      right: 16,
      zIndex: 10,
      // Styles for medium screens and up
      '@media (min-width:600px)': {
        top: 16,
        bottom: 'auto',
        right: 'auto',
        width: '300px',
      },
    }}
  >
    {/* ... FormControl components ... */}
  </Box>
  ```
  This example moves the control box to the bottom on small screens and back to the top-left on screens wider than 600px.

### Touch Interaction

- **OrbitControls**: The `OrbitControls` component from Drei already has excellent built-in support for touch gestures:
  - **One finger**: Rotates the model.
  - **Two fingers (pinch)**: Zooms in and out.
  - **Two fingers (pan)**: Pans the camera.
- **No extra implementation is needed for basic interaction**, but you should always test on a real device to ensure the feel is right.

## 3. Power Consumption

Continuous rendering of a 3D scene can drain a mobile device's battery quickly.

- **Frameloop on Demand**: By default, React Three Fiber re-renders the scene on every frame. If nothing is animating, this is unnecessary. You can set the `frameloop` prop on the `<Canvas>` to `demand`.
  - **How to implement**:
    ```jsx
    <Canvas frameloop="demand">
      {/* ... your scene ... */}
    </Canvas>
    ```
  - When set to `demand`, the scene will only re-render when the camera moves (thanks to `OrbitControls`) or when state changes. This is highly effective for static scenes but requires manual invalidation if you have animations that are not driven by the R3F loop. Since our animations are part of the model, the default `frameloop="always"` is fine while an animation is playing. A more advanced implementation could switch between `demand` and `always` based on whether an animation is active.