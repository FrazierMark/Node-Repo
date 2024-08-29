import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { type Theme } from '#app/utils/theme.server.js'

// @ts-ignore
import fragmentShader from '../Shaders/Background/fragmentShader.glsl'
// @ts-ignore
import vertexShader from '../Shaders/Background/vertexShader.glsl'

interface BackgroundProps {
	theme: Theme
}

const Background = ({ theme }: BackgroundProps) => {
	const mesh = useRef(null)

	const { colorA, colorB } = useControls({
		colorA: '#ff4336',
		colorB: '#f1fdff',
	})

	const uniforms = useMemo(
		() => ({
			u_time: {
				value: 0,
			},
			u_colorA: { value: new THREE.Color(colorA) },
			u_colorB: { value: new THREE.Color(colorB) },
			u_noiseStrength: { value: 0.15 },
			u_noiseDensity: { value: 4.9 },
		}),
		[],
	)

	useEffect(() => {
		if (uniforms.u_colorA && uniforms.u_colorB) {
			uniforms.u_colorA.value.set(colorA)
			uniforms.u_colorB.value.set(colorB)
		}
		if (theme === 'dark') {
			uniforms.u_colorA.value.set('#ff4336')
			uniforms.u_colorB.value.set('#f1fdff')
		}
		if (theme === 'light') {
			uniforms.u_colorA.value.set('#0B6623')
			uniforms.u_colorB.value.set('#f1fdff')
		}
	}, [colorA, colorB, uniforms, theme])

	useFrame((state) => {
		const { clock } = state
		if (mesh.current) {
			mesh.current.material.uniforms.u_time.value = clock.getElapsedTime()
		}
	})

	return (
		<mesh
			ref={mesh}
			position={[0, 0, 0]}
			rotation={[-Math.PI / 2, 0, 0]}
			scale={1.5}
		>
			{/* <planeGeometry args={[1, 1, 16, 16]} /> */}
			<planeGeometry args={[1, 1, 256, 256]} />
			<shaderMaterial
				fragmentShader={fragmentShader}
				vertexShader={vertexShader}
				uniforms={uniforms}
			/>
		</mesh>
	)
}

export default Background
