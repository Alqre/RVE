import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame, staticFile } from 'remotion';
import type { GameSlot, MainSceneProps, MatchFormat } from '../schema';
import { GAMES_BY_FORMAT, getPlanningDuration } from '../schema';

const TEAM_GLOW_COLORS: Record<string, string> = {
	sinners: 'rgba(168, 85, 247, 0.35)',
	elysium: 'rgba(59, 130, 246, 0.55)',
	oboy: 'rgba(235, 54, 54, 0.55)',
};
const DEFAULT_GLOW_COLOR = 'rgba(0, 0, 0, 0.55)';

function teamGlowColor(teamName?: string): string {
	return (teamName && TEAM_GLOW_COLORS[teamName.trim().toLowerCase()]) || DEFAULT_GLOW_COLOR;
}

const Logo: React.FC<{ src: string; teamName?: string }> = ({ src, teamName }) => {
	const glowColor = teamGlowColor(teamName);
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

const MATCH_FORMAT_LABELS: Record<MatchFormat, string> = {
	BO3: 'Best of 3',
	BO4: 'Best of 4',
	BO5: 'Best of 5',
	BO7: 'Best of 7',
};

const Placeholder: React.FC<{ width: number; height: number }> = ({ width, height }) => (
	<div style={{ width, height, border: '2px dashed #444', borderRadius: 12 }} />
);

const FORMAT_LAYOUT: Record<MatchFormat, { scale: number; columnGap: number; carousel: boolean, TimeInFrames: number }> = {
	BO3: { scale: 1.6, columnGap: 305, carousel: false, TimeInFrames: 600 },
	BO4: { scale: 1.6, columnGap: 305, carousel: true, TimeInFrames: 750 },
	BO5: { scale: 1.6, columnGap: 305, carousel: true, TimeInFrames: 900 },
	BO7: { scale: 1.6, columnGap: 305, carousel: true, TimeInFrames: 1200 },
};

const GameColumn: React.FC<{
	game: GameSlot;
	index: number;
	frame: number;
	scale: number;
	isTiebreaker: boolean;
	pickerLogoSrc: string;
	pickerTeamName?: string;
}> = ({ game, index, frame, scale, isTiebreaker, pickerLogoSrc, pickerTeamName }) => {
	const delay = index * 6;
	const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
	const s = (value: number) => value * scale;

	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s(12), opacity, width: s(160) }}>
			<div style={{ border: '3px solid #eb3636', padding: s(4), position: 'relative', width: s(294), height: s(204) }}>
				<div
					style={{
						position: 'absolute',
						left: s(-16),
						top: '50%',
						transform: 'translateY(-50%)',
						width: s(32),
						height: s(32),
						borderRadius: '50%',
						backgroundColor: '#eb3636',
						color: '#fff',
						fontFamily: 'bebas kai',
						fontSize: s(20),
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 1,
					}}
				>
					{index + 1}
				</div>
				{game.mapSrc ? (
					<Img src={staticFile(game.mapSrc)} style={{ width: s(282), objectFit: 'contain' }} />
				) : (
					<Placeholder width={s(282)} height={s(192)} />
				)}
				<div style={{ position: 'absolute', left: s(-20), top: s(-4) }}>
					{game.killerSrc ? (
						<Img
							src={staticFile(game.killerSrc)}
							style={{
								height: s(198),
								objectFit: 'contain',
								WebkitMaskImage: `linear-gradient(to right, black ${s(150)}px, transparent ${s(170)}px)`,
								maskImage: `linear-gradient(to right, black ${s(150)}px, transparent ${s(170)}px)`,
							}}
						/>
					) : (
						<Placeholder width={s(160)} height={s(192)} />
					)}
				</div>
				<div style={{ position: 'absolute', top: s(8), right: s(8) }}>
					{isTiebreaker ? (
						<div
							style={{
								backgroundColor: '#eb3636',
								color: '#fff',
								fontFamily: 'bebas kai',
								fontSize: s(16),
								padding: `${s(2)}px ${s(6)}px`,
								whiteSpace: 'nowrap',
							}}
						>
							TIEBREAKER
						</div>
					) : pickerLogoSrc ? (
						<Img
							src={staticFile(pickerLogoSrc)}
							style={{
								width: s(56),
								height: s(56),
								objectFit: 'contain',
								filter: `drop-shadow(0 0 ${s(6)}px ${teamGlowColor(pickerTeamName)})`,
							}}
						/>
					) : (
						<Placeholder width={s(48)} height={s(48)} />
					)}
				</div>
			</div>
			<span style={{ marginTop: s(-10), color: '#eb3636', fontSize: s(36), fontFamily: 'bebas kai', width: s(282), textAlign: 'center' }}>
				{game.killerName || '—'}
			</span>
			<span style={{ marginTop: s(-15), color: '#e7e3db', fontSize: s(24), fontFamily: 'bebas kai', width: s(282), textAlign: 'center' }}>
				{game.mapName || '—'}
			</span>
		</div>
	);
};

const CAROUSEL_VIEWPORT_WIDTH = 1500;
const CAROUSEL_EDGE_FADE = 300;

type TeamInfo = MainSceneProps['teamA'];

const CarouselRow: React.FC<{
	games: GameSlot[];
	frame: number;
	scale: number;
	columnGap: number;
	teamA: TeamInfo;
	teamB: TeamInfo;
	durationInFrames: number;
}> = ({ games, frame, scale, columnGap, teamA, teamB, durationInFrames }) => {
	const columnWidth = 160 * scale;
	const step = columnWidth + columnGap;
	const firstGameCenteredOffset = CAROUSEL_VIEWPORT_WIDTH / 2 - columnWidth / 2;
	const lastGameCenterLocal = (games.length - 1) * step + columnWidth / 2;
	const lastGameCenteredOffset = CAROUSEL_VIEWPORT_WIDTH / 2 - lastGameCenterLocal;
	const moveStart = 30;
	const moveEnd = durationInFrames - 30;
	const rampDuration = 60;
	const totalMoveDuration = moveEnd - moveStart;
	const rampFraction = rampDuration / (2 * (totalMoveDuration - rampDuration));
	const progress = (() => {
		const rampInEnd = moveStart + rampDuration;
		const rampOutStart = moveEnd - rampDuration;
		if (frame <= moveStart) return 0;
		if (frame >= moveEnd) return 1;
		if (frame < rampInEnd) {
			const local = interpolate(frame, [moveStart, rampInEnd], [0, 1], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			});
			return local * local * rampFraction;
		}
		if (frame < rampOutStart) {
			const local = interpolate(frame, [rampInEnd, rampOutStart], [0, 1], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			});
			return rampFraction + local * (1 - rampFraction * 2);
		}
		const local = interpolate(frame, [rampOutStart, moveEnd], [0, 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
		return (1 - rampFraction) + (1 - (1 - local) * (1 - local)) * rampFraction;
	})();
	const offset = firstGameCenteredOffset + (lastGameCenteredOffset - firstGameCenteredOffset) * progress;

	return (
		<div
			style={{
				width: CAROUSEL_VIEWPORT_WIDTH,
				overflow: 'hidden',
				WebkitMaskImage: `linear-gradient(to right, transparent 0, black ${CAROUSEL_EDGE_FADE}px, black calc(100% - ${CAROUSEL_EDGE_FADE}px), transparent 100%)`,
				maskImage: `linear-gradient(to right, transparent 0, black ${CAROUSEL_EDGE_FADE}px, black calc(100% - ${CAROUSEL_EDGE_FADE}px), transparent 100%)`,
			}}
		>
			<div style={{ display: 'flex', gap: columnGap, transform: `translateX(${offset}px)` }}>
				{games.map((game, index) => {
					const isTiebreaker = index === games.length - 1;
					const picker = index % 2 === 0 ? teamA : teamB;
					return (
						<GameColumn
							key={index}
							game={game}
							index={index}
							frame={frame}
							scale={scale}
							isTiebreaker={isTiebreaker}
							pickerLogoSrc={picker.logoSrc}
							pickerTeamName={picker.teamName}
						/>
					);
				})}
			</div>
		</div>
	);
};

export const Planning: React.FC<MainSceneProps> = (props) => {
	const { teamA, teamB, roundLabel, matchFormat, game1, game2, game3, game4, game5, game6, game7 } = props;
	const frame = useCurrentFrame();

	const allGames = [game1, game2, game3, game4, game5, game6, game7];
	const activeCount = GAMES_BY_FORMAT[matchFormat] ?? GAMES_BY_FORMAT.BO3;
	const activeGames = allGames.slice(0, activeCount);
	const layout = FORMAT_LAYOUT[matchFormat] ?? FORMAT_LAYOUT.BO3;
	const durationInFrames = getPlanningDuration(matchFormat);
	const fadeInOpacity = interpolate(frame, [0, 30], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const opacity_in = interpolate(frame, [0, 30], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.ease),
	});
	const opacity_in_2 = interpolate(frame, [0, 60], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.ease),
	});
	const opacity_out = interpolate(frame, [layout.TimeInFrames-30, layout.TimeInFrames], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.ease),
	});
	const pos = interpolate(frame, [0, 30], [-69, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.ease),
	});
	const redRectScaleX = interpolate(frame, [0, 30], [0, 1], { 
		extrapolateLeft: 'clamp', 
		extrapolateRight: 'clamp', 
		easing: Easing.inOut(Easing.ease) });
	return (
		<AbsoluteFill>
			<AbsoluteFill>
				<Img src={staticFile('video_file_remotion/global_bg.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			</AbsoluteFill>
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: opacity_out }}>
				<div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', top: 165, left: 160, width: 770, height: 165, backgroundColor: '#e7e3db', overflow: 'hidden' }}>
					<p style={{ marginTop: 16, marginLeft: 30, textAlign: 'left', color: '#121212', fontFamily: 'bebas kai', fontSize: 70, opacity: 1 }}>CURRENT MATCH UP</p>
					<p style={{ marginTop: -85, marginLeft: 30, textAlign: 'left', color: '#121212', fontFamily: 'bebas kai', fontSize: 50, opacity: 1 }}>{roundLabel || '—'} - {MATCH_FORMAT_LABELS[matchFormat] ?? matchFormat}</p>
					<Img src={staticFile('video_file_remotion/RVL_Logo_2.png')} style={{ position: 'absolute', top: -30, left: 520, width: 250, opacity: 0.15 }} />
				</div >
				<div
					style={{
						position: 'absolute',
						top: 350,
						left: 910,
						width: 20,
						height: 20,
						backgroundColor: '#eb3636',
						transformOrigin: 'right center',
					}} />
				<div
					style={{
						position: 'absolute',
						top: 350,
						left: 160,
						width: 730,
						height: 20,
						backgroundColor: '#eb3636',
						transformOrigin: 'right center',
						transform: `scaleX(${redRectScaleX})`,
					}} />
				<div style={{ position: 'absolute', top: 165, right: 165, display: 'flex', alignItems: 'center', gap: 64 }}>
					<div style={{ opacity: opacity_in_2, top: pos, position: 'relative' }}>
						<Logo src={teamA.logoSrc} teamName={teamA.teamName} />
					</div>
					<span style={{ color: '#eb3636', fontFamily: 'bebas kai', fontSize: 80 }}>VS</span>
					<div style={{ opacity: opacity_in_2, top: pos, position: 'relative' }}>
						<Logo src={teamB.logoSrc} teamName={teamB.teamName} />
					</div>
				</div>
				<div style={{ display: 'flex', justifyContent: 'center', marginTop: 300, opacity: opacity_in }}>
					{layout.carousel ? (
						<CarouselRow
							games={activeGames}
							frame={frame}
							scale={layout.scale}
							columnGap={layout.columnGap}
							teamA={teamA}
							teamB={teamB}
							durationInFrames={durationInFrames}
						/>
					) : (
						<div style={{ display: 'flex', gap: layout.columnGap }}>
							{activeGames.map((game, index) => {
								const isTiebreaker = index === activeGames.length - 1;
								const picker = index % 2 === 0 ? teamA : teamB;
								return (
									<GameColumn
										key={index}
										game={game}
										index={index}
										frame={frame}
										scale={layout.scale}
										isTiebreaker={isTiebreaker}
										pickerLogoSrc={picker.logoSrc}
										pickerTeamName={picker.teamName}
									/>
								);
							})}
						</div>
					)}
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{ zIndex: 3, backgroundColor: '#000', opacity: fadeInOpacity }} />
		</AbsoluteFill>
	);
};
