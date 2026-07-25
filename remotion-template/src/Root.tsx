import React from 'react';
import {Composition} from 'remotion';
import {MainScene, getTotalDuration} from './compositions/MainScene';
import {mainSceneSchema, defaultMainSceneProps} from './schema';

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="MainScene"
			component={MainScene}
			calculateMetadata={({props}) => ({durationInFrames: getTotalDuration(props.matchFormat)})}
			fps={30}
			width={1920}
			height={1080}
			schema={mainSceneSchema}
			defaultProps={defaultMainSceneProps}
		/>
	);
};
