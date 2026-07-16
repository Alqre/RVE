import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile} from 'remotion';
import type {MainSceneProps} from '../schema';

const resolveSrc = (src: string) => (src ? staticFile(src) : undefined);

export const Intro: React.FC<MainSceneProps> = ({teamA, teamB, roundLabel}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const slideA = spring({frame, fps, config: {damping: 200}, durationInFrames: 25});
	const slideB = spring({frame, fps, config: {damping: 200}, durationInFrames: 25});
	const labelOpacity = interpolate(frame, [10, 25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	const teamAX = interpolate(slideA, [0, 1], [-500, 0]);
	const teamBX = interpolate(slideB, [0, 1], [500, 0]);

	return (
		<AbsoluteFill style={{backgroundColor: '#0e0e14', justifyContent: 'center', alignItems: 'center'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 80}}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateX(${teamAX}px)`}}>
					<Img src={resolveSrc(teamA.logoSrc) ?? ''} style={{width: 220, height: 220, objectFit: 'contain'}} />
					<span style={{color: 'white', fontSize: 42, fontFamily: 'sans-serif', marginTop: 16}}>{teamA.teamName}</span>
				</div>
				<span style={{color: '#e6b800', fontSize: 64, fontFamily: 'sans-serif', opacity: labelOpacity}}>VS</span>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateX(${teamBX}px)`}}>
					<Img src={resolveSrc(teamB.logoSrc) ?? ''} style={{width: 220, height: 220, objectFit: 'contain'}} />
					<span style={{color: 'white', fontSize: 42, fontFamily: 'sans-serif', marginTop: 16}}>{teamB.teamName}</span>
				</div>
			</div>
			<div style={{position: 'absolute', bottom: 90, color: '#ffffffaa', fontSize: 32, fontFamily: 'sans-serif', opacity: labelOpacity}}>
				{roundLabel}
			</div>
		</AbsoluteFill>
	);
};
