import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, useCurrentFrame, staticFile} from 'remotion';
import type {MainSceneProps, UpcomingMatch} from '../schema';

const TeamTag: React.FC<{logoSrc: string; name: string}> = ({logoSrc, name}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 12, width: 260}}>
		{logoSrc ? (
			<Img src={staticFile(logoSrc)} style={{width: 48, height: 48, objectFit: 'contain'}} />
		) : (
			<div style={{width: 48, height: 48, border: '2px dashed #444', borderRadius: 8}} />
		)}
		<span style={{color: 'white', fontSize: 24, fontFamily: 'sans-serif'}}>{name || '—'}</span>
	</div>
);

const MatchRow: React.FC<{match: UpcomingMatch; delay: number; frame: number}> = ({match, delay, frame}) => {
	const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const x = interpolate(frame, [delay, delay + 15], [-40, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				gap: 40,
				backgroundColor: '#1b1b24',
				padding: '20px 32px',
				borderRadius: 12,
				opacity,
				transform: `translateX(${x}px)`,
			}}
		>
			<TeamTag logoSrc={match.team1LogoSrc} name={match.team1Name} />
			<span style={{color: '#e6b800', fontSize: 22, fontFamily: 'sans-serif'}}>VS</span>
			<TeamTag logoSrc={match.team2LogoSrc} name={match.team2Name} />
			<span style={{color: '#ccc', fontSize: 20, fontFamily: 'sans-serif', width: 200, textAlign: 'right'}}>
				{match.date || 'Date TBD'}
			</span>
		</div>
	);
};

export const Schedule: React.FC<MainSceneProps> = ({match1, match2, match3, schedulePeriod}) => {
	const frame = useCurrentFrame();
	const matches = [match1, match2, match3];

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{zIndex: 0}}>
				<Img src={staticFile('video_file_remotion/global_bg.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
			<AbsoluteFill style={{zIndex: 1, justifyContent: 'center', alignItems: 'center'}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: 32, width: 1200}}>
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
						<span style={{color: 'white', fontSize: 28, fontFamily: 'sans-serif', textAlign: 'center'}}>
							Upcoming Matches
						</span>
						<span style={{color: '#e6b800', fontSize: 20, fontFamily: 'sans-serif', textAlign: 'center'}}>
							{schedulePeriod || '—'}
						</span>
					</div>
					{matches.map((match, index) => (
						<MatchRow key={index} match={match} delay={index * 8} frame={frame} />
					))}
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{zIndex: 2}}>
				<OffthreadVideo transparent src={staticFile('video_file_remotion/scene3.webm')} loop style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
