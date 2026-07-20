import React from 'react';
import {Composition} from 'remotion';
import {MainScene, getTotalDuration} from './compositions/MainScene';
import {mainSceneSchema, defaultMainSceneProps} from './schema';

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="MainScene"
			component={MainScene}
			// La durée totale dépend du format du match (voir getTotalDuration dans
			// MainScene.tsx) : calculateMetadata la recalcule à partir des props actuelles
			// plutôt que d'utiliser une constante figée.
			calculateMetadata={({props}) => ({durationInFrames: getTotalDuration(props.matchFormat)})}
			fps={30}
			width={1920}
			height={1080}
			schema={mainSceneSchema}
			defaultProps={defaultMainSceneProps}
		/>
	);
};
