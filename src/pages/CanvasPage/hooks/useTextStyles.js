import { useMemo } from 'react';
import * as PIXI from 'pixi.js';

export function useTextStyles(fontLoaded, fontFamily = 'Cormorant Garamond') {
  return useMemo(() => {
    if (!fontLoaded) {
      return {
        titleStyle: new PIXI.TextStyle({
          fill: 'white',
          fontSize: 48,
          fontFamily: 'Arial',
          fontWeight: 'bold',
        }),
        authorStyle: new PIXI.TextStyle({
          fill: '#cccccc',
          fontSize: 24,
          fontFamily: 'Arial',
          fontStyle: 'italic',
        }),
        lineStyle: new PIXI.TextStyle({
          fill: 'white',
          fontSize: 32,
          fontFamily: 'Arial',
          lineHeight: 44,
        }),
      };
    }

    return {
      titleStyle: new PIXI.TextStyle({
        fill: 'white',
        fontSize: 48,
        fontFamily,
        fontWeight: 'bold',
      }),
      authorStyle: new PIXI.TextStyle({
        fill: '#cccccc',
        fontSize: 24,
        fontFamily,
        fontStyle: 'italic',
      }),
      lineStyle: new PIXI.TextStyle({
        fill: 'white',
        fontSize: 32,
        fontFamily,
        lineHeight: 44,
      }),
    };
  }, [fontLoaded, fontFamily]);
}
