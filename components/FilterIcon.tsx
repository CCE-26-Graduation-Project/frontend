import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function FilterIcon({ size = 24, color = '#000000' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 4.5C3 4.22386 3.22386 4 3.5 4H20.5C20.7761 4 21 4.22386 21 4.5C21 4.63261 20.9473 4.75979 20.8536 4.85355L14.5 11.2071V19.5C14.5 19.6989 14.3946 19.8831 14.2236 19.9856C14.0526 20.0881 13.8406 20.0941 13.6639 20.0012L9.66394 17.8746C9.47822 17.7774 9.36128 17.584 9.36128 17.3734V11.2071L3.14645 4.85355C3.05268 4.75979 3 4.63261 3 4.5Z"
        fill={color}
      />
    </Svg>
  );
}
