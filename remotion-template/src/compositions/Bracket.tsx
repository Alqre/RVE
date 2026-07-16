import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, staticFile} from 'remotion';
import type {MainSceneProps} from '../schema';

const Row: React.FC<{logoSrc: string; teamName: string; delay: number; frame: number}> = ({logoSrc, teamName, delay, frame}) => {
	const scale = interpolate(frame, [delay, delay + 15], [0.6, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 24,
				backgroundColor: '#1b1b24',
				padding: '16px 32px',
				borderRadius: 12,
				transform: `scale(${scale})`,
				opacity,
			}}
		>
			{logoSrc ? <Img src={staticFile(logoSrc)} style={{width: 56, height: 56, objectFit: 'contain'}} /> : null}
			<span style={{color: 'white', fontSize: 32, fontFamily: 'sans-serif'}}>{teamName}</span>
		</div>
	);
};

export const Bracket: React.FC<MainSceneProps> = ({teamA, teamB, roundLabel}) => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: '#0e0e14', justifyContent: 'center', alignItems: 'center', gap: 32}}>
			<div style={{color: '#e6b800', fontSize: 28, fontFamily: 'sans-serif', marginBottom: 24}}>{roundLabel} — Bracket</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
				<Row logoSrc={teamA.logoSrc} teamName={teamA.teamName} delay={5} frame={frame} />
				<Row logoSrc={teamB.logoSrc} teamName={teamB.teamName} delay={20} frame={frame} />
			</div>
		</AbsoluteFill>
	);
};
