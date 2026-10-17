import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, staticFile, Easing } from 'remotion';
import type { MainSceneProps, ScoreboardBoardKey, StandingsTeam } from '../schema';
import { getScoreboardSceneDuration, SCOREBOARD_BOARDS, selectedScoreboardBoards } from '../schema';

const PHASE_FADE_FRAMES = 15;

const BOARD_STYLES: Record<ScoreboardBoardKey, { title: string; accentColor: string }> = {
	division1: { title: 'DIVISION 1', accentColor: '#eb3636' },
	division2: { title: 'DIVISION 2', accentColor: '#e7e3db' },
	apac: { title: 'APAC', accentColor: '#eb3636' },
	oce: { title: 'OCE', accentColor: '#e7e3db' },
};
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
		<div style={{ gridArea: '1 / 1', alignSelf: 'center', width: 1300, opacity, position: 'relative' }}>
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
	const boards = selectedScoreboardBoards(props.scoreboardBoards);
	const sceneDuration = getScoreboardSceneDuration('Scoreboard', props.scoreboardBoards);
	const phaseFrames = sceneDuration / boards.length;
	const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
	const fadeInOpacity = interpolate(frame, [sceneDuration - 30, sceneDuration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
	const topPos = interpolate(frame, [0, 30], [40, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.ease),
	});

	const boardOpacity = (index: number) => {
		const start = index * phaseFrames;
		const end = start + phaseFrames;
		return interpolate(frame, [start, start + PHASE_FADE_FRAMES, end - PHASE_FADE_FRAMES, end], [0, 1, 1, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	};

	const boardTeams = (board: ScoreboardBoardKey): StandingsTeam[] =>
		Array.from({ length: SCOREBOARD_BOARDS.find((b) => b.key === board)?.teamCount ?? 0 }, (_, index) => props[`${board}Team${index + 1}` as keyof MainSceneProps] as StandingsTeam);

	return (
		<AbsoluteFill>
			<AbsoluteFill>
				<Img src={staticFile('video_file_remotion/global_bg.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			</AbsoluteFill>
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity, top: topPos }}>
				<div style={{ position: 'relative', marginTop: 40 }}>
					<div style={{ display: 'grid' }}>
						{boards.map((board, index) => (
							<DivisionTable
								key={board}
								title={BOARD_STYLES[board].title}
								teams={boardTeams(board)}
								opacity={boardOpacity(index)}
								accentColor={BOARD_STYLES[board].accentColor}
							/>
						))}
					</div>
					{boards.length > 1 && (
						<div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 28, display: 'flex', justifyContent: 'center', gap: 16 }}>
							{boards.map((board, index) => (
								<div
									key={board}
									style={{ width: 70, height: 10, borderRadius: 6, backgroundColor: BOARD_STYLES[board].accentColor, opacity: 0.25 + boardOpacity(index) * 0.75 }}
								/>
							))}
						</div>
					)}
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{ zIndex: 3, backgroundColor: '#000', opacity: fadeInOpacity }} />
		</AbsoluteFill>
	);
};
