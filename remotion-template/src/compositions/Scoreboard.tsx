import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, staticFile, Easing } from 'remotion';
import type { MainSceneProps, StandingsTeam } from '../schema';

const WINDOW_PHASE_FRAMES = 300;
const PHASE_FADE_FRAMES = 15;
const COLUMN_WIDTHS = { rank: 60, record: 260, points: 100 };

function sortStandings(teams: StandingsTeam[]): StandingsTeam[] {
	return [...teams].sort((a, b) => {
		const pointsDiff = (parseInt(b.points, 10) || 0) - (parseInt(a.points, 10) || 0);
		if (pointsDiff !== 0) return pointsDiff;
		const winsDiff = (parseInt(b.wins, 10) || 0) - (parseInt(a.wins, 10) || 0);
		if (winsDiff !== 0) return winsDiff;
		return (parseInt(a.losses, 10) || 0) - (parseInt(b.losses, 10) || 0);
	});
}

const StandingsHeaderRow: React.FC<{ accentColor: string }> = ({ accentColor }) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: 16,
			padding: '14px 24px',
			backgroundColor: accentColor,
			borderBottom: '3px solid #121212',
		}}
	>
		<span style={{ width: COLUMN_WIDTHS.rank, textAlign: 'center', color: '#121212', fontFamily: 'bebas kai', fontSize: 26, letterSpacing: 1.5 }}>
			RANK
		</span>
		<span style={{ flex: 1, textAlign: 'center', color: '#121212', fontFamily: 'bebas kai', fontSize: 26, letterSpacing: 1.5 }}>TEAM</span>
		<span style={{ width: COLUMN_WIDTHS.record, textAlign: 'center', whiteSpace: 'nowrap', color: '#121212', fontFamily: 'bebas kai', fontSize: 26, letterSpacing: 1.5 }}>
			WIN - LOSE - DRAW
		</span>
		<span style={{ width: COLUMN_WIDTHS.points, textAlign: 'center', color: '#121212', fontFamily: 'bebas kai', fontSize: 26, letterSpacing: 1.5 }}>
			POINTS
		</span>
	</div>
);

const StandingsRow: React.FC<{ rank: number; team: StandingsTeam }> = ({ rank, team }) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: 16,
			padding: '12px 24px',
			position: 'relative',
			overflow: 'hidden',
			backgroundColor: rank % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
			borderBottom: '2px solid #2a2a33',
		}}
	>
		<span style={{ width: COLUMN_WIDTHS.rank, textAlign: 'center', color: rank === 1 ? '#f5c542' : '#eb3636', fontFamily: 'bebas kai', fontSize: 30 }}>
			{rank}
		</span>
		<span style={{ flex: 1, position: 'relative', textAlign: 'center' }}>
			{team.logoSrc && (
				<Img
					src={staticFile(team.logoSrc)}
					style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						height: 260,
						width: 'auto',
						maxWidth: 'none',
						objectFit: 'contain',
						opacity: 0.16,
						zIndex: 0,
						pointerEvents: 'none',
					}}
				/>
			)}
			<span style={{ position: 'relative', zIndex: 1, color: '#e7e3db', fontFamily: 'bebas kai', fontSize: 30 }}>{team.teamName || '—'}</span>
		</span>
		<span style={{ width: COLUMN_WIDTHS.record, textAlign: 'center', color: '#999', fontFamily: 'bebas kai', fontSize: 24 }}>
			<span style={{ color: '#24b862' }}>{team.wins || '0'}</span> - <span style={{ color: '#eb3636' }}>{team.losses || '0'}</span> - {team.ties || '0'}
		</span>
		<span style={{ width: COLUMN_WIDTHS.points, textAlign: 'center', color: '#e7e3db', fontFamily: 'bebas kai', fontSize: 30 }}>
			{team.points || '0'} <span style={{ fontSize: 18, color: '#999' }}>PTS</span>
		</span>
	</div>
);

const DivisionTable: React.FC<{ title: string; teams: StandingsTeam[]; opacity: number; accentColor: string }> = ({
	title,
	teams,
	opacity,
	accentColor,
}) => {
	const sorted = sortStandings(teams);
	return (
		<div style={{ gridArea: '1 / 1', width: 1300, opacity, position: 'relative' }}>
			<p
				style={{
					position: 'absolute',
					bottom: '100%',
					left: 0,
					right: 0,
					marginBottom: 20,
					color: accentColor,
					fontFamily: 'bebas kai',
					fontSize: 52,
					textAlign: 'center',
					letterSpacing: 2,
				}}
			>
				{title}
			</p>
			<div
				style={{
					backgroundColor: 'rgba(18,18,18,0.82)',
					overflow: 'visible',
					border: `3px solid ${accentColor}`,
				}}
			>
				<StandingsHeaderRow accentColor={accentColor} />
				{sorted.map((team, index) => (
					<StandingsRow key={index} rank={index + 1} team={team} />
				))}
			</div>
		</div>
	);
};

export const Scoreboard: React.FC<MainSceneProps> = (props) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
	const fadeInOpacity = interpolate(frame, [570, 600], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
	const topPos = interpolate(frame, [0, 30], [40, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.ease),
	});

	const cyclePos = frame % (WINDOW_PHASE_FRAMES * 2);
	const division1Opacity = interpolate(
		cyclePos,
		[0, PHASE_FADE_FRAMES, WINDOW_PHASE_FRAMES - PHASE_FADE_FRAMES, WINDOW_PHASE_FRAMES, WINDOW_PHASE_FRAMES * 2],
		[0, 1, 1, 0, 0],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
	);
	const division2Opacity = interpolate(
		cyclePos,
		[0, WINDOW_PHASE_FRAMES, WINDOW_PHASE_FRAMES + PHASE_FADE_FRAMES, WINDOW_PHASE_FRAMES * 2 - PHASE_FADE_FRAMES, WINDOW_PHASE_FRAMES * 2],
		[0, 0, 1, 1, 0],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
	);

	const division1Teams = [
		props.division1Team1,
		props.division1Team2,
		props.division1Team3,
		props.division1Team4,
		props.division1Team5,
		props.division1Team6,
		props.division1Team7,
		props.division1Team8,
	];
	const division2Teams = [
		props.division2Team1,
		props.division2Team2,
		props.division2Team3,
		props.division2Team4,
		props.division2Team5,
		props.division2Team6,
		props.division2Team7,
		props.division2Team8,
	];

	return (
		<AbsoluteFill>
			<AbsoluteFill>
				<Img src={staticFile('video_file_remotion/global_bg.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			</AbsoluteFill>
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity, top: topPos }}>
				<div style={{ position: 'relative', marginTop: 40 }}>
					<div style={{ display: 'grid' }}>
						<DivisionTable title="DIVISION 1" teams={division1Teams} opacity={division1Opacity} accentColor="#eb3636" />
						<DivisionTable title="DIVISION 2" teams={division2Teams} opacity={division2Opacity} accentColor="#e7e3db" />
					</div>
					<div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 28, display: 'flex', justifyContent: 'center', gap: 16 }}>
						<div style={{ width: 70, height: 10, borderRadius: 6, backgroundColor: '#eb3636', opacity: 0.25 + division1Opacity * 0.75 }} />
						<div style={{ width: 70, height: 10, borderRadius: 6, backgroundColor: '#e7e3db', opacity: 0.25 + division2Opacity * 0.75 }} />
					</div>
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{ zIndex: 3, backgroundColor: '#000', opacity: fadeInOpacity }} />
		</AbsoluteFill>
	);
};
