import React, {forwardRef} from 'react';
import {Player, type PlayerRef} from '@remotion/player';
import {MainScene, getTotalDuration} from '../../../../../remotion-template/src/compositions/MainScene';
import type {MainSceneProps} from '../../../../../remotion-template/src/schema';

interface Props {
  inputProps: MainSceneProps;
}

const CHECKERBOARD_BACKGROUND = {
  backgroundImage:
    'linear-gradient(45deg, #444 25%, transparent 25%), linear-gradient(-45deg, #444 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #444 75%), linear-gradient(-45deg, transparent 75%, #444 75%)',
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  backgroundColor: '#666',
};

export const PreviewPlayer = forwardRef<PlayerRef, Props>(({inputProps}, ref) => {
  return (
    <div style={{...(inputProps.transparentIntro ? CHECKERBOARD_BACKGROUND : {}), width: '100%', borderRadius: 8}}>
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
    </div>
  );
});

PreviewPlayer.displayName = 'PreviewPlayer';
