import React from 'react';
import {Series} from 'remotion';
import type {MainSceneProps, MatchFormat} from '../schema';
import {getPlanningDuration} from '../schema';
import {Intro} from './Intro';
import {Bracket} from './Bracket';
import {Planning} from './Planning';
import {Schedule} from './Schedule';

export const INTRO_DURATION = 600; // 20s @ 30fps
export const OTHER_SUB_SCENE_DURATION = 600; // 20s @ 30fps

export function getTotalDuration(matchFormat: MatchFormat): number {
	return INTRO_DURATION + getPlanningDuration(matchFormat) + OTHER_SUB_SCENE_DURATION * 2;
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
            <Series.Sequence durationInFrames={OTHER_SUB_SCENE_DURATION}>
				<Bracket {...props} />
			</Series.Sequence>
        </Series>
    );
};
