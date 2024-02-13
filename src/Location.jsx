import React, { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import ARCanvas from './ARCanvas'
import ARMarker from './ARMarker'
import useTimeout from './useTimeout'

import * as merc from 'mercator-projection'

function Box(props) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef()

  React.useEffect(() => {
    console.log(meshRef.current)
  }, [meshRef])
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(true)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (meshRef.current.rotation.x += delta))
  useFrame((state, delta) => (meshRef.current.rotation.y += delta))
  useFrame((state, delta) => (meshRef.current.position.z = -10.2188944816589355))
  useFrame((state, delta) => (meshRef.current.position.x = props.position[0]))
  useFrame((state, delta) => (meshRef.current.position.y = props.position[1]))
        
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      
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
  const [initCoords, setInitCoords] = React.useState()
  const [coords, setCoords] = React.useState()

  React.useEffect(() => {
    console.log('initial coord', initCoords)
  }, [initCoords])

  React.useEffect(() => {
    console.log('current coords', coords)
  }, [coords])

  const { reset } = useTimeout(() => {
    navigator.geolocation.getCurrentPosition(function(position) {
      try {
        console.log(position.coords)
        const {latitude, longitude} = position.coords
        const xy = merc.fromLatLngToPoint({lat: latitude, lng: longitude})
        if (!initialized) {
          setInitCoords({ x: xy.x, y: xy.y})
          setInitialized(true)
        } else {
          setCoords({
            x: initCoords.x - xy.x,
            y: initCoords.y - xy.y
          })
        }
      } catch (_e) {
        console.log(_e)
      }
    })
    reset()
  }, 2000)

  return (
    <ARCanvas
    gl={{
      antialias: false,
      powerPreference: "default",
      physicallyCorrectLights: true,
    }}
      onCreated={({ gl }) => {
        console.log(gl)
        gl.setSize(window.innerWidth, window.innerHeight)
      }}>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Box 
      frustumCulled={false}
      position={undefined !== coords ? [
        coords.x,
        coords.y,
        -10.2188944816589355
      ] : [
        -0.3376249194145191,
        -2.2927881717681884,
        -10.2188944816589355
      ]
      }/>
    </ARCanvas>
  )
}

  /**
      <ARMarker
        params={{ smooth: true }}
        type={"pattern"}
        patternUrl={"/data/patt.hiro"}
        onMarkerFound={() => {
          console.log("Marker Found")
        }}>
        <Box />
      </ARMarker>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <ARMarker
      params={{ smooth: true }}
      type={"pattern"}
      patternUrl={"data/patt.hiro"}
      onMarkerFound={() => {
        console.log("Marker Found")
      }}>
        <Box position={[-1.2, 0, 0]} />
        <Box position={[
          -0.3376249194145191,
          -2.2927881717681884,
          -10.2188944816589355
        ]} />
      </ARMarker>
      */
