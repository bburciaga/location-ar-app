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
  useFrame((state, delta) => (meshRef.current.rotation.x += delta))
  useFrame((state, delta) => (meshRef.current.rotation.y += delta))
  useFrame((state, delta) => (meshRef.current.position.z = props.position[2]))
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
  const [initialPos, setInitialPos] = React.useState({lat: 0, lng: 0})
  const [initCoords, setInitCoords] = React.useState({x: 0, y:0})
  const [coords, setCoords] = React.useState({x: 0, y: 0})

  React.useEffect(() => {
    console.log('initial pos', initialPos)
  }, [initialPos])

  React.useEffect(() => {
    console.log('current coords', coords)
  }, [coords])

  const { reset } = useTimeout(() => {
    navigator.geolocation.getCurrentPosition(function(position) {
      try {
        const {latitude, longitude} = position.coords
        // initial is 0,0
        // coord update
        // new coords = {0 + coord.x, 0 + coord.y}
        if (!initialized) {
          console.log(latitude, longitude)
          setInitialPos({lat: latitude, lng: longitude})
          setInitialized(true)
        } else {
          const xyInit = merc.fromLatLngToPoint({lat: initialPos.lat, lng: initialPos.lng})
          const xy = merc.fromLatLngToPoint({lat: latitude, lng: longitude})
          setCoords({x: xyInit.x-xy.x, y: (xyInit.y-xy.y) * 100000})
        }
      } catch (_e) {
        console.log(_e)
      }
    })
    reset()
  }, 500)

  return (
    <div style={{position: 'relative',height: '100%', width: '100%'}}>
      <div style={{
        lineHeight: '1em',
        textAlign: 'left',
        fontSize: '4em',
        wordBreak: 'break-word',
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
      height: '100%'}}>x:{coords.x}
      <br />
      y:{coords.y}</div>
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
          coords.y
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
