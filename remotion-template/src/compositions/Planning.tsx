import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, staticFile} from 'remotion';
import type {GameSlot, MainSceneProps} from '../schema';
import {GAMES_BY_FORMAT} from '../schema';

const Placeholder: React.FC = () => (
	<div style={{width: 120, height: 120, border: '2px dashed #444', borderRadius: 12}} />
);

const GameColumn: React.FC<{game: GameSlot; index: number; frame: number}> = ({game, index, frame}) => {
	const delay = index * 6;
	const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity, width: 160}}>
			<span style={{color: '#e6b800', fontSize: 20, fontFamily: 'sans-serif'}}>Manche {index + 1}</span>
			{game.killerSrc ? (
				<Img src={staticFile(game.killerSrc)} style={{width: 120, height: 120, objectFit: 'contain'}} />
			) : (
				<Placeholder />
			)}
			<span style={{color: 'white', fontSize: 18, fontFamily: 'sans-serif'}}>{game.killerName || '—'}</span>
			{game.mapSrc ? (
				<Img src={staticFile(game.mapSrc)} style={{width: 120, height: 120, objectFit: 'contain'}} />
			) : (
				<Placeholder />
			)}
			<span style={{color: '#ccc', fontSize: 16, fontFamily: 'sans-serif'}}>{game.mapName || '—'}</span>
		</div>
	);
};

export const Planning: React.FC<MainSceneProps> = (props) => {
	const {roundLabel, matchFormat, game1, game2, game3, game4, game5, game6, game7} = props;
	const frame = useCurrentFrame();

	const allGames = [game1, game2, game3, game4, game5, game6, game7];
	const activeCount = GAMES_BY_FORMAT[matchFormat] ?? GAMES_BY_FORMAT.BO3;
	const activeGames = allGames.slice(0, activeCount);

	return (
		<AbsoluteFill style={{backgroundColor: '#0e0e14', justifyContent: 'center', alignItems: 'center'}}>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32}}>
				<span style={{color: 'white', fontSize: 28, fontFamily: 'sans-serif'}}>
					Planning — {roundLabel} ({matchFormat})
				</span>
				<div style={{display: 'flex', gap: 28}}>
					{activeGames.map((game, index) => (
						<GameColumn key={index} game={game} index={index} frame={frame} />
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};
