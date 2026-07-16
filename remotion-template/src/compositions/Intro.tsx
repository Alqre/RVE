import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile} from 'remotion';
import type {MainSceneProps} from '../schema';

const Logo: React.FC<{src: string}> = ({src}) =>
	src ? (
		<Img src={staticFile(src)} style={{width: 220, height: 220, objectFit: 'contain'}} />
	) : (
		<div style={{width: 220, height: 220, border: '3px dashed #444', borderRadius: 16}} />
	);

const CasterTag: React.FC<{imageSrc: string; name: string}> = ({imageSrc, name}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
		{imageSrc ? (
			<Img src={staticFile(imageSrc)} style={{width: 48, height: 48, borderRadius: 24, objectFit: 'cover'}} />
		) : (
			<div style={{width: 48, height: 48, borderRadius: 24, border: '2px dashed #444'}} />
		)}
		<span style={{color: 'white', fontSize: 22, fontFamily: 'bebas kai'}}>{name || '—'}</span>
	</div>
);

export const Intro: React.FC<MainSceneProps> = ({teamA, teamB, roundLabel, casterA, casterB}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const slideA = spring({frame, fps, config: {damping: 200}, durationInFrames: 25});
	const slideB = spring({frame, fps, config: {damping: 200}, durationInFrames: 25});
	const labelOpacity = interpolate(frame, [10, 25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	const teamAX = interpolate(slideA, [0, 1], [-500, 0]);
	const teamBX = interpolate(slideB, [0, 1], [500, 0]);

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{zIndex: 0}}>
				<OffthreadVideo src={staticFile('video_file_remotion/scene1_bg.mp4')} loop style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
			<AbsoluteFill style={{zIndex: 1, justifyContent: 'center', alignItems: 'center'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 80}}>
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateX(${teamAX}px)`}}>
						<Logo src={teamA.logoSrc} />
						<span style={{color: 'white', fontSize: 42, fontFamily: 'bebas kai', marginTop: 16}}>{teamA.teamName || '—'}</span>
					</div>
					<span style={{color: '#fe2d2d', fontSize: 64, fontFamily: 'bebas kai', opacity: labelOpacity}}>VS</span>
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateX(${teamBX}px)`}}>
						<Logo src={teamB.logoSrc} />
						<span style={{color: 'white', fontSize: 42, fontFamily: 'bebas kai', marginTop: 16}}>{teamB.teamName || '—'}</span>
					</div>
				</div>
				<div style={{position: 'absolute', bottom: 330,right:270, color: '#fe2d2d', fontSize: 24, fontFamily: 'bebas kai', opacity: labelOpacity}}>
					{roundLabel || '—'}
				</div>
				<div style={{position: 'absolute', bottom: 90, display: 'flex', alignItems: 'center', gap: 16, opacity: labelOpacity}}>
					<span style={{color: '#fe2d2d', fontSize: 22, fontFamily: 'bebas kai'}}>Commenté par</span>
					<CasterTag imageSrc={casterA.imageSrc} name={casterA.name} />
					<CasterTag imageSrc={casterB.imageSrc} name={casterB.name} />
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{zIndex: 2}}>
				<OffthreadVideo src={staticFile('video_file_remotion/scene1_over.webm')} loop style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
