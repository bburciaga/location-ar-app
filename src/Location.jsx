import React, { useRef, useState } from 'react'
import {useFrame} from '@react-three/fiber'

import ARCanvas from './ar/ARCanvas'
import { calculateDistance } from './utils/geometry'
import { useDeviceOrientation } from './orientation/useDeviceOrientation';
import useTimeout from './hooks/useTimeout'
import handleOrientation from './utils/orientation'
import useGyroscope from 'react-hook-gyroscope'
import DeviceOrientation from 'react-device-orientation'

import * as merc from 'mercator-projection'

function Box(props) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef()
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(true)

  React.useEffect(() => {
    //console.log(meshRef.current)
  }, [meshRef])

  // Subscribe this component to the render-loop, rotate the mesh every frame
  //useFrame((state, delta) => (meshRef.current.rotation.x += delta)) // Rotation in x axis
  useFrame((state, delta) => (meshRef.current.rotation.x = props.rotation.alpha)) // Rotation in y axis
  useFrame((state, delta) => (meshRef.current.rotation.y = props.rotation.gamma)) // Rotation in y axis
  //useFrame((state, delta) => (meshRef.current.position.z = props.position[2]))
  //useFrame((state, delta) => (meshRef.current.position.y = props.position[1]))
        
  return (
            <mesh
              position={props.position}
              ref={meshRef}
              scale={1.5}
              onClick={(event) => setActive(!active)}
              onPointerOver={(event) => setHover(true)}
              onPointerOut={(event) => setHover(false)}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
            </mesh>
  )
}


export default function Location ({children}) {
  const [initialized, setInitialized] = React.useState(false)
  const [initialPos, setInitialPos] = React.useState({lat: 0, lng: 0})
  const [coords, setCoords] = React.useState({x: 0, z: 0, distance: 0})

  React.useEffect(() => {
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
              {`Alpha: ${alpha.toFixed(5)}`}
              <br />
              {`Beta: ${beta.toFixed(5)}`}
              <br />
              {`Gamma: ${gamma.toFixed(5)}`}
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

