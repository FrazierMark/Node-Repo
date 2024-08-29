import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { type Theme } from '#app/utils/theme.server.ts'
import Background from './Background'

interface CanvasSceneProps {
	theme: Theme
}

const CanvasScene = ({ theme }: CanvasSceneProps) => {
	return (
		<Canvas
			style={{
				position: 'absolute',
				inset: 0,
				height: '100%',
				width: '100%',
				zIndex: -10,
			}}
			camera={{ position: [0, 0.15, 0], near: 0.01, far: 400 }}
		>
			{/* <color args={['#FFFFFF']} attach="background" /> */}
			<Leva hidden />

			<OrbitControls />
			<Background theme={theme} />
		</Canvas>
	)
}

export default CanvasScene
