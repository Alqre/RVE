import React from 'react';
import {Series} from 'remotion';
import type {MainSceneProps} from '../schema';
import {Intro} from './Intro';
import {Bracket} from './Bracket';
import {Planning} from './Planning';
import {Schedule} from './Schedule';

export const SUB_SCENE_DURATION = 150; // 5s @ 30fps chacune
export const SUB_SCENE_COUNT = 4;

export const MainScene: React.FC<MainSceneProps> = (props) => {
	return (
		<Series>
			<Series.Sequence durationInFrames={SUB_SCENE_DURATION}>
				<Intro {...props} />
			</Series.Sequence>
			<Series.Sequence durationInFrames={SUB_SCENE_DURATION}>
				<Planning {...props} />
			</Series.Sequence>
			<Series.Sequence durationInFrames={SUB_SCENE_DURATION}>
				<Schedule {...props} />
			</Series.Sequence>
			<Series.Sequence durationInFrames={SUB_SCENE_DURATION}>
				<Bracket {...props} />
			</Series.Sequence>
		</Series>
	);
};
