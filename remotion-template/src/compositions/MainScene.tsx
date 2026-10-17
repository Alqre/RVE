import React from 'react';
import {Series} from 'remotion';
import type {MainSceneProps} from '../schema';
import {getPlanningDuration, getScoreboardSceneDuration} from '../schema';
import {Intro} from './Intro';
import {Bracket} from './Bracket';
import {Scoreboard} from './Scoreboard';
import {Planning} from './Planning';
import {Schedule} from './Schedule';

export const INTRO_DURATION = 600;
export const OTHER_SUB_SCENE_DURATION = 600;

type DurationProps = Pick<MainSceneProps, 'matchFormat' | 'bracketMode' | 'scoreboardBoards'>;

export function getTotalDuration({matchFormat, bracketMode, scoreboardBoards}: DurationProps): number {
	return (
		INTRO_DURATION +
		getPlanningDuration(matchFormat) +
		OTHER_SUB_SCENE_DURATION +
		getScoreboardSceneDuration(bracketMode, scoreboardBoards)
	);
}

export const MainScene: React.FC<MainSceneProps> = (props) => {
	const planningDuration = getPlanningDuration(props.matchFormat);
	return (
        <Series>
            <Series.Sequence durationInFrames={INTRO_DURATION}>
				<Intro {...props} />
			</Series.Sequence>
            <Series.Sequence durationInFrames={planningDuration}>
				<Planning {...props} />
			</Series.Sequence>
            <Series.Sequence durationInFrames={OTHER_SUB_SCENE_DURATION}>
				<Schedule {...props} />
			</Series.Sequence>
            <Series.Sequence durationInFrames={getScoreboardSceneDuration(props.bracketMode, props.scoreboardBoards)}>
				{props.bracketMode === 'Scoreboard' ? <Scoreboard {...props} /> : <Bracket {...props} />}
			</Series.Sequence>
        </Series>
    );
};
