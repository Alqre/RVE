import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, useCurrentFrame, staticFile} from 'remotion';
import type {MainSceneProps} from '../schema';

export const Planning: React.FC<MainSceneProps> = ({roundLabel, clipInsertSrc}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{backgroundColor: '#0e0e14', justifyContent: 'center', alignItems: 'center'}}>
			<div style={{opacity, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24}}>
				<span style={{color: '#e6b800', fontSize: 28, fontFamily: 'sans-serif'}}>Planning — {roundLabel}</span>
				{clipInsertSrc ? (
					<OffthreadVideo src={staticFile(clipInsertSrc)} style={{width: 960, height: 540, objectFit: 'cover', borderRadius: 16}} />
				) : (
					<div
						style={{
							width: 960,
							height: 540,
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
						Clip vidéo ici
					</div>
				)}
			</div>
		</AbsoluteFill>
	);
};
