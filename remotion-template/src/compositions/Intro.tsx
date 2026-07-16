import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import type { MainSceneProps } from '../schema';

const Logo: React.FC<{ src: string }> = ({ src }) =>
	src ? (
		<Img src={staticFile(src)} style={{ width: 175, height: 175, objectFit: 'contain' }} />
	) : (
		<div style={{ width: 175, height: 175, border: '3px dashed #444', borderRadius: 16 }} />
	);

const CasterTag: React.FC<{ imageSrc: string; name: string }> = ({ imageSrc, name }) => (
	imageSrc ? (
		<Img src={staticFile(imageSrc)} style={{ width: 210, height: 210, objectFit: 'cover' }} />
	) : (
		<div style={{ width: 210, height: 210, borderRadius: 24, border: '3px dashed #444' }} />
	)
);

export const Intro: React.FC<MainSceneProps> = ({ teamA, teamB, roundLabel, casterA, casterB }) => {
	const frame = useCurrentFrame();
	const labelOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{ zIndex: 0 }}>
				<OffthreadVideo src={staticFile('video_file_remotion/scene1_bg.mp4')} loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			</AbsoluteFill>
			<AbsoluteFill style={{ zIndex: 1 }}>
				<div style={{ position: 'absolute', bottom: 69, right: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 17.5 }}>
					<Logo src={teamA.logoSrc} />
					<span style={{ fontSize: 32, color: '#fe2d2d', fontFamily: 'bebas kai' }}>{teamA.teamName || '—'}</span>
				</div>
				<div style={{ position: 'absolute', bottom: 69, right: 95, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 17.5 }}>
					<Logo src={teamB.logoSrc} />
					<span style={{ fontSize: 32, color: '#fe2d2d', fontFamily: 'bebas kai' }}>{teamB.teamName || '—'}</span>
				</div>
				<div style={{ position: 'absolute', bottom: 340, right: 200, left: 1450, opacity: labelOpacity }}>
					<div style={{ color: '#e7e3db',fontSize: 24, fontFamily: 'bebas kai', textAlign: 'center' }}>
						{roundLabel || '—'}</div>
				</div>
				<div style={{ position: 'absolute', bottom: 69, left: 122.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 17.5 }}>
					<CasterTag imageSrc={casterA.imageSrc} name={casterA.name} />
					<span style={{ fontSize: 32, color: '#fe2d2d', fontFamily: 'bebas kai' }}>{casterA.name || '—'}</span>
				</div>
				<div style={{ position: 'absolute', bottom: 69, left: 402.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 17.5 }}>
					<CasterTag imageSrc={casterB.imageSrc} name={casterB.name} />
					<span style={{ fontSize: 32, color: '#fe2d2d', fontFamily: 'bebas kai' }}>{casterB.name || '—'}</span>
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{ zIndex: 2 }}>
				<OffthreadVideo transparent src={staticFile('video_file_remotion/scene1_over.webm')} loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
