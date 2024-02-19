import React, { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { LocationBased } from '@ar-js-org/ar.js'
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
  // useFrame((state, delta) => (meshRef.current.rotation.x += delta)) // Rotation in x axis
  // useFrame((state, delta) => (meshRef.current.rotation.y += delta)) // Rotation in y axis
  //useFrame((state, delta) => (meshRef.current.position.z = props.position[2]))
  //useFrame((state, delta) => (meshRef.current.position.y = props.position[1]))
        
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props} 
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
  const [coords, setCoords] = React.useState({x: 0, y: 0, distance: 0})


  React.useEffect(() => {
    console.log('Initial Position',initialPos)
  }, [initialPos])

  React.useEffect(() => {
    console.log('Current Coordinates', coords)
  }, [coords])

  const { reset } = useTimeout(() => {
    navigator.geolocation.getCurrentPosition(function(position) {
      try {
        const {latitude, longitude} = position.coords
        if (!initialized) {
          setInitialPos({lat: latitude, lng: longitude})
          setInitialized(true)
        } else {
          const d = calculateDistance(initialPos, {lat: latitude, lng: longitude})
          const xyInit = merc.fromLatLngToPoint({lat: initialPos.lat, lng: initialPos.lng})
          const xy = merc.fromLatLngToPoint({lat: latitude, lng: longitude})
          setCoords({x: xyInit.x-xy.x, y: (xyInit.y-xy.y) * 1000, distance: d})
        }
      } catch (_e) {
        console.log(_e)
      }
    })
    reset()
  }, 2000)

  return (
    <div style={{position: 'relative',height: '100%', width: '100%'}}>
      <div style={{
        lineHeight: '1em',
        textAlign: 'left',
        fontSize: '2em',
        wordBreak: 'break-word',
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
      height: '100%'}}>x:{coords.x}
      <br />
      y:{coords.y}
      <br />
      dist: {coords.distance} m
    </div>
      <ARCanvas
      position={[0, 0, 0]}
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
        position={[
          0,
          0, // DO NOT CHANGE
          -1 * coords.distance
        ]
        }/>
      </ARCanvas>
    </div>
  )
}

  /**
          -10.2188944816589355
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
function calculateDistance(coord1, coord2) {
  const RADIUS_OF_EARTH = 6371000; // meters
  const dLat = degToRad(coord2.lat - coord1.lat);
  const dLon = degToRad(coord2.lng - coord1.lng);

  const a = Math.sin(dLat / 2)** 2 + Math.cos(degToRad(coord1.lat))
    * Math.cos(degToRad(coord2.lat)) * Math.sin(dLon / 2) ** 2;
 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return RADIUS_OF_EARTH * c;
}

function degToRad(deg) {
  return deg * (Math.PI / 180);
}
