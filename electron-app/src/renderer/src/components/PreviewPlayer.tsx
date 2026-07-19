import React, {forwardRef} from 'react';
import {Player, type PlayerRef} from '@remotion/player';
import {MainScene, TOTAL_DURATION} from '../../../../../remotion-template/src/compositions/MainScene';
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
      durationInFrames={TOTAL_DURATION}
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
