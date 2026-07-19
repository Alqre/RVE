import React from 'react';
import {Series} from 'remotion';
import type {MainSceneProps} from '../schema';
import {Intro} from './Intro';
import {Bracket} from './Bracket';
import {Planning} from './Planning';
import {Schedule} from './Schedule';

export const INTRO_DURATION = 600; // 20s @ 30fps
export const OTHER_SUB_SCENE_DURATION = 450; // 15s @ 30fps
export const TOTAL_DURATION = INTRO_DURATION + OTHER_SUB_SCENE_DURATION * 3;

export const MainScene: React.FC<MainSceneProps> = (props) => {
	return (
        <Series>
            <Series.Sequence durationInFrames={INTRO_DURATION}>
				<Intro {...props} />
			</Series.Sequence>
            <Series.Sequence durationInFrames={OTHER_SUB_SCENE_DURATION}>
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
