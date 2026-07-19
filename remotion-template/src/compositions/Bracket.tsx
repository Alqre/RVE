import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, staticFile, Easing } from 'remotion';
import type { MainSceneProps } from '../schema';

export const Bracket: React.FC<MainSceneProps> = ({ bracketImageSrc }) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
	const fadeInOpacity = interpolate(frame, [420, 450], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
	const leftpos = interpolate(frame, [0, 30], [-100, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.inOut(Easing.ease),
		});

	return (
		<AbsoluteFill>
			<AbsoluteFill>
				<Img src={staticFile('video_file_remotion/global_bg.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			</AbsoluteFill>
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity, left: leftpos }}>
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
			<AbsoluteFill style={{ zIndex: 3, backgroundColor: '#000', opacity: fadeInOpacity }} />
		</AbsoluteFill>
	);
};
