import React from 'react';
import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, useCurrentFrame, staticFile } from 'remotion';
import type { MainSceneProps } from '../schema';

const TEAM_GLOW_COLORS: Record<string, string> = {
	sinners: 'rgba(168, 85, 247, 0.35)',
	elysium: 'rgba(59, 130, 246, 0.55)',
	oboy: 'rgba(235, 54, 54, 0.55)',
};

const DEFAULT_GLOW_COLOR = 'rgba(0, 0, 0, 0.55)';

const GAME_WINDOW = { right: 127, bottom: 109, width: 416, height: 234 };
const GAME_WINDOW_LEFT = 1920 - GAME_WINDOW.right - GAME_WINDOW.width;
const GAME_WINDOW_TOP = 1080 - GAME_WINDOW.bottom - GAME_WINDOW.height;
const GAME_WINDOW_BORDER_WIDTH = 3;
const GAME_WINDOW_HOLE_GAP = 2;
const GAME_WINDOW_HOLE_INSET = GAME_WINDOW_BORDER_WIDTH + GAME_WINDOW_HOLE_GAP;
const WINDOW_PHASE_FRAMES = 300;
const PHASE_FADE_FRAMES = 15;

const Logo: React.FC<{ src: string; teamName?: string }> = ({ src, teamName }) => {
	const glowColor = (teamName && TEAM_GLOW_COLORS[teamName.trim().toLowerCase()]) || DEFAULT_GLOW_COLOR;
	return src ? (
		<Img
			src={staticFile(src)}
			style={{
				width: 205,
				height: 205,
				objectFit: 'contain',
				filter: `drop-shadow(0 0 12px ${glowColor})`,
			}}
		/>
	) : (
		<div style={{ width: 205, height: 205, border: '3px dashed #444', borderRadius: 16 }} />
	);
};

const CasterTag: React.FC<{ imageSrc: string; name: string }> = ({ imageSrc, name }) => (
	imageSrc ? (
		<Img src={staticFile(imageSrc)} style={{ width: 210, height: 210, objectFit: 'cover' }} />
	) : (
		<div style={{ width: 210, height: 210, borderRadius: 24, border: '3px dashed #444' }} />
	)
);

export const Intro: React.FC<MainSceneProps> = ({ teamA, teamB, roundLabel, casterA, casterB, transparentIntro }) => {
	const frame = useCurrentFrame();
	const labelOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
	const fadeInOpacity = interpolate(frame, [0, 30, 570, 600], [1, 0, 0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
	const redRectScaleX = interpolate(frame, [0, 30], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp',easing: Easing.inOut(Easing.ease) });
	const redRectScaleX_2 = interpolate(frame, [30, 60], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp',easing: Easing.inOut(Easing.ease) });
	const cyclePos = frame % (WINDOW_PHASE_FRAMES * 2);
	const logoPhaseOpacity = interpolate(
		cyclePos,
		[0, PHASE_FADE_FRAMES, WINDOW_PHASE_FRAMES - PHASE_FADE_FRAMES, WINDOW_PHASE_FRAMES, WINDOW_PHASE_FRAMES * 2],
		[0, 1, 1, 0, 0],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
	);
	const windowPhaseOpacity = interpolate(
		cyclePos,
		[0, WINDOW_PHASE_FRAMES, WINDOW_PHASE_FRAMES + PHASE_FADE_FRAMES, WINDOW_PHASE_FRAMES * 2 - PHASE_FADE_FRAMES, WINDOW_PHASE_FRAMES * 2],
		[0, 0, 1, 1, 0],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
	);
	const holeGrey = Math.round(255 * (1 - windowPhaseOpacity));
	const logoOpacity = transparentIntro
		? logoPhaseOpacity
		: interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
	const textOpacity = transparentIntro
		? logoPhaseOpacity
		: interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
	const bottompos = interpolate(frame, [0, 30], [0, 69], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.ease),
	});

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{ zIndex: 0 }}>
				{transparentIntro && (
					<svg width="0" height="0" style={{ position: 'absolute' }}>
						<mask id="gameWindowMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
							<rect x="0" y="0" width="1920" height="1080" fill="white" />
							<rect
								x={GAME_WINDOW_LEFT + GAME_WINDOW_HOLE_INSET}
								y={GAME_WINDOW_TOP + GAME_WINDOW_HOLE_INSET}
								width={GAME_WINDOW.width - GAME_WINDOW_HOLE_INSET * 2}
								height={GAME_WINDOW.height - GAME_WINDOW_HOLE_INSET * 2}
								fill={`rgb(${holeGrey}, ${holeGrey}, ${holeGrey})`}
							/>
						</mask>
					</svg>
				)}
				<AbsoluteFill style={{ mask: transparentIntro ? 'url(#gameWindowMask)' : undefined, WebkitMask: transparentIntro ? 'url(#gameWindowMask)' : undefined }}>
					<OffthreadVideo src={staticFile('video_file_remotion/scene1_bg.mp4')} loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
				</AbsoluteFill>
			</AbsoluteFill>
			<AbsoluteFill style={{ zIndex: 1 }}>
				<div style={{ position: 'absolute', bottom: bottompos, right: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 17.5, opacity: logoOpacity }}>
					<Logo src={teamA.logoSrc} teamName={teamA.teamName} />
					<span style={{ fontSize: 32, color: '#eb3636', fontFamily: 'bebas kai', opacity: textOpacity }}>{teamA.teamName || '—'}</span>
				</div>
				<div style={{ position: 'absolute', bottom: bottompos, right: 83, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 17.5, opacity: logoOpacity }}>
					<Logo src={teamB.logoSrc} teamName={teamB.teamName} />
					<span style={{ fontSize: 32, color: '#eb3636', fontFamily: 'bebas kai', opacity: textOpacity }}>{teamB.teamName || '—'}</span>
				</div>
				<div style={{ position: 'absolute', bottom: 403, right: 200, left: 1450, textAlign: 'center', color: '#eb3636', fontSize: 24, fontFamily: 'bebas kai', letterSpacing: 1, opacity: labelOpacity }}>
					{roundLabel || '—'}
				</div>
				<div style={{ position: 'absolute', bottom: 364, right: 200, left: 1450, textAlign: 'center', color: '#f5f2ec', fontSize: 32, fontFamily: 'bebas kai', letterSpacing: 2.5, whiteSpace: 'nowrap', opacity: labelOpacity * (transparentIntro ? logoPhaseOpacity : 1) }}>
					CURRENT MATCH UP
				</div>
				<div style={{ position: 'absolute', bottom: 364, right: 200, left: 1450, textAlign: 'center', color: '#f5f2ec', fontSize: 32, fontFamily: 'bebas kai', letterSpacing: 2.5, whiteSpace: 'nowrap', opacity: labelOpacity * (transparentIntro ? windowPhaseOpacity : 0) }}>
					MATCH IS BEING SET UP
				</div>
				<div style={{ position: 'absolute', bottom: 364, left: 122.5, width: 490, textAlign: 'center', color: '#e7e3db', fontSize: 32, fontFamily: 'bebas kai', letterSpacing: 2.5, opacity: labelOpacity }}>
					YOUR CASTERS TODAY
				</div>
				<div style={{ position: 'absolute', bottom: 70.5, left: 122.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 17.5 }}>
					<CasterTag imageSrc={casterA.imageSrc} name={casterA.name} />
					<span style={{ fontSize: 32, color: '#eb3636', fontFamily: 'bebas kai', opacity: textOpacity }}>{casterA.name || '—'}</span>
				</div>
				<div style={{ position: 'absolute', bottom: 70.5, left: 402.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 17.5 }}>
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
				{transparentIntro && (
					<div
						style={{
							position: 'absolute',
							right: GAME_WINDOW.right,
							bottom: GAME_WINDOW.bottom,
							width: GAME_WINDOW.width,
							height: GAME_WINDOW.height,
							border: `${GAME_WINDOW_BORDER_WIDTH}px solid #eb3636`,
							opacity: windowPhaseOpacity,
						}}
					/>
				)}
			</AbsoluteFill>
			<AbsoluteFill style={{ zIndex: 3, backgroundColor: '#000', opacity: fadeInOpacity }} />
		</AbsoluteFill>
	);
};
