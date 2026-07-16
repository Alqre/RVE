import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, staticFile} from 'remotion';
import type {MainSceneProps} from '../schema';

export const Bracket: React.FC<MainSceneProps> = ({bracketImageSrc}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{backgroundColor: '#0e0e14', justifyContent: 'center', alignItems: 'center', opacity}}>
			{bracketImageSrc ? (
				<Img src={staticFile(bracketImageSrc)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
			) : (
				<div
					style={{
						width: '80%',
						height: '80%',
						border: '3px dashed #444',
						borderRadius: 16,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: '#666',
						fontSize: 28,
						fontFamily: 'sans-serif',
					}}
				>
					Image du bracket ici
				</div>
			)}
		</AbsoluteFill>
	);
};
