import { Canvas, events } from "@react-three/fiber"

import { AR } from "./ar"

const eventManagerFactory = state => ({
  ...events(state),

  compute(event, state) {
    state.pointer.set(
      (event.clientX / state.size.width) * 2 - 1,
      -(event.clientY / state.size.height) * 2 + 1,
    )
    state.raycaster.setFromCamera(state.pointer, state.camera)
  },
})

function ARCanvas({
  arEnabled = true,
  tracking = true,
  children,
  patternRatio = 0.5,
  detectionMode = "mono_and_matrix",
  cameraParametersUrl = "data/camera_para.dat",
  matrixCodeType = "3x3",
  sourceType = "webcam",
  onCameraStreamReady,
  onCameraStreamError,
  ...props
}) {
  return (
    <Canvas
      events={eventManagerFactory}
      camera={arEnabled ? { position: props.position } : props.camera}
      style={{ pointerEvents: 'none' }}

      {...props}>
      {arEnabled ? (
        <AR
          tracking={tracking}
          patternRatio={patternRatio}
          matrixCodeType={matrixCodeType}
          detectionMode={detectionMode}
          sourceType={sourceType}
          cameraParametersUrl={cameraParametersUrl}
          onCameraStreamReady={onCameraStreamReady}
          onCameraStreamError={onCameraStreamError}>
          {children}
        </AR>
      ) : (
        children
      )}
    </Canvas>
  )
}

export default ARCanvas
