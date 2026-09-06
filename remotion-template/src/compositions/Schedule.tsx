import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame, staticFile } from 'remotion';
import type { MainSceneProps, UpcomingMatch } from '../schema';

const WEEKDAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const MONTHS = [
	'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
	'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

function formatMatchDateTime(value: string): string {
	const date = value ? new Date(value) : null;
	if (!date || Number.isNaN(date.getTime())) return 'Date TBD';
	const weekday = WEEKDAYS[date.getDay()];
	const day = date.getDate();
	const month = MONTHS[date.getMonth()];
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${weekday} ${day} ${month} / ${hours}:${minutes} CET`;
}

function parseMatchDate(value: string): Date | null {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

const MatchRow: React.FC<{ match: UpcomingMatch; delay: number; frame: number; isPast: boolean }> = ({
	match,
	delay,
	frame,
	isPast,
}) => {
	const opacity = interpolate(frame, [delay + 60, delay + 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease), });
	const x = interpolate(frame, [delay + 60, delay + 90], [-80, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease), });

	return (
		<div style={{ opacity: isPast ? opacity * 0.5 : opacity, transform: `translateX(${x}px)` }}>
			<div style={{ textAlign: 'center', color: isPast ? '#666' : '#e7e3db', fontSize: 24, fontFamily: 'roboto', fontWeight: 300 }}>
				{formatMatchDateTime(match.date)}
			</div>
			<div
				style={{
					textAlign: 'center',
					whiteSpace: 'nowrap',
					fontSize: 80,
					fontFamily: 'bebas kai',
					textTransform: 'uppercase',
					color: isPast ? '#6b6b73' : '#e7e3db',
				}}
			>
				{match.team1Name || '—'} <span style={{ color: '#eb3636' }}>VS</span> {match.team2Name || '—'}
			</div>
		</div>
	);
};

export const Schedule: React.FC<MainSceneProps> = ({ teamA, teamB, match1, match2, match3, schedulePeriod, tournamentName }) => {
	const frame = useCurrentFrame();

	const now = Date.now();
	const orderedMatches = [match1, match2, match3]
		.map((match) => {
			const parsed = parseMatchDate(match.date);
			return { match, isPast: parsed !== null && parsed.getTime() < now, sortKey: parsed?.getTime() ?? Infinity };
		})
		.sort((a, b) => {
			if (a.isPast !== b.isPast) return a.isPast ? 1 : -1;
			return a.sortKey - b.sortKey;
		});

	const opacity_1 = interpolate(frame, [25, 60], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.ease),
	});
	const opacity_2 = interpolate(frame, [0, 35], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.ease),
	});
	const leftpos_1 = interpolate(frame, [0, 80], [-600, -200], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.ease),
	});
	const leftpos_2 = interpolate(frame, [0, 60], [-300, 250], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.ease),
	});
	const opacity_out = interpolate(frame, [570, 600], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.ease),
	});

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{ zIndex: 0 }}>
				<Img src={staticFile('video_file_remotion/global_bg.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			</AbsoluteFill>
			<AbsoluteFill style={{ zIndex: 1, opacity: opacity_out }}>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 48, width: 800, position: 'absolute', top: 500, right: 51 }}>
					{orderedMatches.map(({ match, isPast }, index) => (
						<MatchRow key={index} match={match} delay={index * 20} frame={frame} isPast={isPast} />
					))}</div>
				<div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', top: 165, right: 250, width: 400, height: 100, backgroundColor: '#e7e3db', opacity: opacity_2 }}>
					<p style={{ marginTop: 8, textAlign: 'center', color: '#121212', fontFamily: 'bebas kai', fontSize: 28, opacity: 1 }}>{tournamentName || '—'}</p>
					<p style={{ marginTop: -33, textAlign: 'center', color: '#121212', fontFamily: 'bebas kai', fontSize: 50, opacity: 1 }}>{schedulePeriod || '—'}</p>
				</div >
				<div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', top: 240, right: 51, width: 800, opacity: opacity_1 }}>
					<p style={{ textAlign: 'center', color: '#eb3636', fontFamily: 'bebas kai', fontSize: 50, opacity: 1 }}>CURRENT MATCH UP</p>
					<div style={{ textAlign: 'center', marginTop: -54 }}>
						<span style={{ padding: 10, paddingLeft: 25, paddingRight: 25, backgroundColor: '#eb3636', color: '#e7e3db', fontFamily: 'bebas kai', fontSize: 80, opacity: 1 }}>{teamA.teamName || '—'} <span style={{ color: '#121212' }}>VS</span> {teamB.teamName || '—'}</span>
					</div >
				</div>

			</AbsoluteFill>
			<AbsoluteFill style={{ zIndex: 2, flexDirection: 'row', opacity: opacity_out }}>
				<Img src={staticFile('video_file_remotion/Killer1.png')} style={{ width: '50%', position: 'absolute', left: leftpos_1, opacity: opacity_1, filter: 'drop-shadow(0 10px 64px rgba(0, 0, 0, 0.45))' }} />
				<Img src={staticFile('video_file_remotion/Killer2.png')} style={{ width: '50%', position: 'absolute', left: leftpos_2, opacity: opacity_2, filter: 'drop-shadow(0 10px 32px rgba(0, 0, 0, 0.45))' }} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
