import React, {forwardRef} from 'react';
import {Player, type PlayerRef} from '@remotion/player';
import {MainScene, getTotalDuration} from '../../../../../remotion-template/src/compositions/MainScene';
import type {MainSceneProps} from '../../../../../remotion-template/src/schema';

interface Props {
  inputProps: MainSceneProps;
}

export const PreviewPlayer = forwardRef<PlayerRef, Props>(({inputProps}, ref) => {
  return (
    <Player
      ref={ref}
      component={MainScene}
      inputProps={inputProps}
      durationInFrames={getTotalDuration(inputProps.matchFormat)}
      fps={30}
      compositionWidth={1920}
      compositionHeight={1080}
      style={{width: '100%', borderRadius: 8}}
      controls
      loop
    />
  );
});

PreviewPlayer.displayName = 'PreviewPlayer';
