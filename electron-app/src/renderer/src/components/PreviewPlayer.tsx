import React from 'react';
import {Player} from '@remotion/player';
import {MainScene, SUB_SCENE_DURATION, SUB_SCENE_COUNT} from '../../../../../remotion-template/src/compositions/MainScene';
import type {MainSceneProps} from '../../../../../remotion-template/src/schema';

interface Props {
  inputProps: MainSceneProps;
}

export const PreviewPlayer: React.FC<Props> = ({inputProps}) => {
  return (
    <Player
      component={MainScene}
      inputProps={inputProps}
      durationInFrames={SUB_SCENE_DURATION * SUB_SCENE_COUNT}
      fps={30}
      compositionWidth={1920}
      compositionHeight={1080}
      style={{width: '100%', borderRadius: 8}}
      controls
      loop
    />
  );
};
