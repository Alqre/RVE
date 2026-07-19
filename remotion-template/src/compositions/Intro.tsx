import React from 'react';
import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import type { MainSceneProps } from '../schema';

const Logo: React.FC<{ src: string }> = ({ src }) =>
	src ? (
		<Img src={staticFile(src)} style={{ width: 205, height: 205, objectFit: 'contain' }} />
	) : (
		<div style={{ width: 205, height: 205, border: '3px dashed #444', borderRadius: 16 }} />
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
	const { fps } = useVideoConfig();
	const labelOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
	const fadeInOpacity = interpolate(frame, [0, 30, 570, 600], [1, 0, 0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
	// Se réduit sur l'axe X uniquement, ancré à droite (transformOrigin: 'right center')
	// pendant la première seconde. Position/taille/valeurs à ajuster à la main.
	const redRectScaleX = interpolate(frame, [0, 30], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp',easing: Easing.inOut(Easing.ease) });
	const redRectScaleX_2 = interpolate(frame, [30, 60], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp',easing: Easing.inOut(Easing.ease) });
	const logoOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
	const textOpacity = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
	const bottompos = interpolate(frame, [0, 30], [0, 69], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.ease),
	});

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{ zIndex: 0 }}>
				<OffthreadVideo src={staticFile('video_file_remotion/scene1_bg.mp4')} loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			</AbsoluteFill>
			<AbsoluteFill style={{ zIndex: 1 }}>
				<div style={{ position: 'absolute', bottom: bottompos, right: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 17.5, opacity: logoOpacity }}>
					<Logo src={teamA.logoSrc} />
					<span style={{ fontSize: 32, color: '#eb3636', fontFamily: 'bebas kai', opacity: textOpacity }}>{teamA.teamName || '—'}</span>
				</div>
				<div style={{ position: 'absolute', bottom: bottompos, right: 84, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 17.5, opacity: logoOpacity }}>
					<Logo src={teamB.logoSrc} style={{ opacity: labelOpacity }} />
					<span style={{ fontSize: 32, color: '#eb3636', fontFamily: 'bebas kai', opacity: textOpacity }}>{teamB.teamName || '—'}</span>
				</div>
				<div style={{ position: 'absolute', bottom: 405, right: 200, left: 1450, opacity: labelOpacity }}>
					<div style={{ color: '#e7e3db', fontSize: 20, fontFamily: 'roboto', textAlign: 'center' }}>
						{roundLabel || '—'}</div>
				</div>
				<div style={{ position: 'absolute', bottom: 69, left: 122.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 17.5 }}>
					<CasterTag imageSrc={casterA.imageSrc} name={casterA.name} />
					<span style={{ fontSize: 32, color: '#eb3636', fontFamily: 'bebas kai', opacity: textOpacity }}>{casterA.name || '—'}</span>
				</div>
				<div style={{ position: 'absolute', bottom: 69, left: 402.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 17.5 }}>
					<CasterTag imageSrc={casterB.imageSrc} name={casterB.name} />
					<span style={{ fontSize: 32, color: '#eb3636', fontFamily: 'bebas kai', opacity: textOpacity }}>{casterB.name || '—'}</span>
				</div>
				<div
					style={{
						position: 'absolute',
						bottom: 118,
						left: 115,
						width: 225,
						height: 225,
						border: '3px solid #eb3636',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						bottom: 118,
						left: 115,
						width: 225,
						height: 225,
						backgroundColor: '#eb3636',
						transformOrigin: 'right center',
						transform: `scaleX(${redRectScaleX})`,
					}}
				/>
				<div
					style={{
						position: 'absolute',
						bottom: 118,
						left: 395,
						width: 225,
						height: 225,
						border: '3px solid #eb3636',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						bottom: 118,
						left: 395,
						width: 225,
						height: 225,
						backgroundColor: '#eb3636',
						transformOrigin: 'right center',
						transform: `scaleX(${redRectScaleX_2})`,
					}}
				/>
			</AbsoluteFill>
			<AbsoluteFill style={{ zIndex: 3, backgroundColor: '#000', opacity: fadeInOpacity }} />
		</AbsoluteFill>
	);
};
