import React from 'react';
import {Composition} from 'remotion';
import {MainScene, SUB_SCENE_DURATION, SUB_SCENE_COUNT} from './compositions/MainScene';
import {mainSceneSchema, defaultMainSceneProps} from './schema';

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="MainScene"
			component={MainScene}
			durationInFrames={SUB_SCENE_DURATION * SUB_SCENE_COUNT}
			fps={30}
			width={1920}
			height={1080}
			schema={mainSceneSchema}
			defaultProps={defaultMainSceneProps}
		/>
	);
};
