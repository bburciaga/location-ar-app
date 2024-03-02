import { useRef, useState, useEffect} from 'react'
import {useFrame} from '@react-three/fiber'

import ARCanvas from './ar/ARCanvas'
import { calculateDistance } from './utils/geometry'
import useTimeout from './hooks/useTimeout'
import DeviceOrientation from 'react-device-orientation'

/**
 * Renders a 3D box mesh in the scene with dynamic behavior. The component allows the box to be interactively
 * rotated and positioned based on provided props. It uses React Three Fiber's useFrame for potential
 * real-time updates to its rotation and position, demonstrating how to integrate interactive 3D elements
 * with user input or external data. The box changes color when hovered and toggles its 'active' state on click.
 *
 * @param {Object} props - Contains properties to control the box's appearance and behavior.
 * @param {Object} props.rotation - An object with alpha and beta properties representing the rotation angles in degrees.
 *                                  Alpha controls the rotation around the z-axis, and beta controls the rotation around the x-axis.
 * @param {Array} props.position - An array representing the box's position in 3D space as [x, y, z].
 */
function Box(props) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef()
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(true)

  // Dynamically update position based on alpha and beta
  useEffect(() => {
    //console.log(meshRef.current)
  }, [meshRef])

  //useFrame((state, delta) => (meshRef.current.rotation.z += props.rotation.gamma)) // Rotation in y axis
  useFrame((state, delta) => (meshRef.current.position.x = props.rotation.gamma * Math.PI / 180)) 

  return (
    <mesh
      position={props.position}
      ref={meshRef}
      scale={1.5}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

/**
 * The Location component is responsible for integrating geolocation data with augmented reality (AR) content. 
 * It initializes the user's geolocation and updates the state based on changes in the user's position. 
 * This component uses the HTML Geolocation API to periodically fetch the current position of the device and calculates
 * the distance moved from an initial position. It then visualizes this information alongside device orientation data
 * within an AR environment, using React Three Fiber's ARCanvas and a custom Box component for rendering.
 * The component displays the device's orientation (alpha, beta, gamma) and the calculated distance from the initial position.
 * It utilizes a custom hook, useTimeout, to periodically update the geolocation data and recalculate distances.
 * Children components can access and utilize the device's orientation and calculated position for rendering or other purposes,
 * making this component a foundational part of creating interactive, location-aware AR experiences.
 *
 * @param {Object} props - Contains properties and children for the component.
 * @param {ReactNode} props.children - React children that can be AR content or any other elements to be rendered within the Location component.
 */
export default function Location ({children}) {
  const [initialized, setInitialized] = useState(false)
  const [initialPos, setInitialPos] = useState({lat: 0, lng: 0})
  const [coords, setCoords] = useState({x: 0, z: 0, distance: 0})

  useEffect(() => {
    console.log('Initial Position',initialPos)
  }, [initialPos])

  const { reset } = useTimeout(() => {
    navigator.geolocation.getCurrentPosition(function(position) {
      try {
        const {latitude, longitude} = position.coords
        if (!initialized) {
          setInitialPos({lat: latitude, lng: longitude})
          setInitialized(true)
        } else {
          // distance in lat exlusively
          const d1 = calculateDistance(
            { lat: latitude, lng: longitude },
            { lat: initialPos.lat, lng: longitude }
          )
          const d2 = calculateDistance(
            { lat: latitude, lng: longitude },
            { lat: latitude, lng: initialPos.lng }
          )
          // distance in lng exclusively
          const d = calculateDistance(initialPos, {lat: latitude, lng: longitude})
          setCoords({x: d1, z: -1 * d2, distance: -1 * d})
        }
      } catch (_e) {
        console.log(_e)
      }
    })

    reset()
  }, 2000)

  return (
    <div style={{position: 'relative',height: '100%', width: '100%'}}>
      <DeviceOrientation>
        {({ absolute, alpha, beta, gamma }) => (
          <div>
            <div style={{
              lineHeight: '1em',
              textAlign: 'left',
              fontSize: '2em',
              wordBreak: 'break-word',
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%'}}>
              {`Absolute: ${absolute}`}
              <br />
              {`Alpha: ${alpha ? alpha.toFixed(5) : 0}`}
              <br />
              {`Beta: ${beta ? beta.toFixed(5) : 0}`}
              <br />
              {`Gamma: ${gamma ? gamma.toFixed(5) : 0}`}
              <br />
              dist: {coords.distance.toFixed(5)} m
            </div>
            <ARCanvas
              position={[0, 0, 0]}
              gl={{
                antialias: false,
                powerPreference: "default",
                physicallyCorrectLights: true,
              }}
              onCreated={({ gl }) => {
                gl.setSize(window.innerWidth, window.innerHeight)
              }}>
              <ambientLight intensity={Math.PI / 2} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
              <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
              <Box 
                rotation={{alpha: alpha, beta: beta, gamma: gamma}}
                frustumCulled={false}
                position={[
                  0,
                  0, // DO NOT CHANGE
                  -10
                ]}
                />
            </ARCanvas>
          </div>
        )}
      </DeviceOrientation>
    </div>
  )
}

