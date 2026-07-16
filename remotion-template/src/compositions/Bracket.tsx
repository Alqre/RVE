import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, staticFile } from 'remotion';
import type { MainSceneProps } from '../schema';

export const Bracket: React.FC<MainSceneProps> = ({ bracketImageSrc }) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 30, 570, 600], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
	const opacity_bg = interpolate(frame, [570, 600], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{ opacity: opacity_bg }}>
				<Img src={staticFile('video_file_remotion/global_bg.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			</AbsoluteFill>
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity }}>
				{bracketImageSrc ? (
					<Img src={staticFile(bracketImageSrc)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
						Bracket image goes here
					</div>
				)}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
