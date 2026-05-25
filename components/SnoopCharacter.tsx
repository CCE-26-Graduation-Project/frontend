import React from 'react';
import Svg, { G, Path, Ellipse, Circle, Line, Rect } from 'react-native-svg';
import { theme } from '../constants/theme';

export type SnoopExpression = 'neutral' | 'happy' | 'thinking' | 'listening' | 'surprised' | 'waving';

interface SnoopProps {
  expression?: SnoopExpression;
  size?: number;
  body?: string;
  outline?: string;
  ear?: string;
  highlight?: string;
}

export function SnoopCharacter({ expression = 'neutral', size = 120, body, outline, ear, highlight }: SnoopProps) {
  const fill = body ?? theme.colors.character;
  const stroke = outline ?? theme.colors.characterInk;
  const earColor = ear ?? theme.colors.bg2;
  const accent = highlight ?? theme.colors.accent;
  const blush = 'rgba(252, 165, 165, 0.55)';
  const tongue = '#F08AA0';
  const sw = 3.2;

  const Body = (
    <G>
      <Ellipse cx={100} cy={186} rx={52} ry={5.5} fill={stroke} opacity={0.10} />
      <Path
        d="M50 152 C 50 178, 150 178, 150 152 L 150 138 Q 100 156 50 138 Z"
        fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
      />
      <G transform="rotate(-12, 42, 110)">
        <Ellipse cx={42} cy={118} rx={22} ry={40} fill={earColor} stroke={stroke} strokeWidth={sw} />
      </G>
      <G transform="rotate(12, 158, 110)">
        <Ellipse cx={158} cy={118} rx={22} ry={40} fill={earColor} stroke={stroke} strokeWidth={sw} />
      </G>
      <Ellipse cx={100} cy={98} rx={56} ry={54} fill={fill} stroke={stroke} strokeWidth={sw} />
      <Path d="M55 78 Q 70 60 95 62 Q 80 75 70 88 Z" fill={earColor} opacity={0.55} />
      <Path d="M145 78 Q 130 60 105 62 Q 120 75 130 88 Z" fill={earColor} opacity={0.55} />
      <Ellipse cx={100} cy={116} rx={28} ry={20} fill={fill} stroke={stroke} strokeWidth={sw - 0.4} />
    </G>
  );

  let face: React.ReactNode = null;
  let extras: React.ReactNode = null;

  if (expression === 'neutral') {
    face = (
      <G>
        <Circle cx={82} cy={92} r={4.2} fill={stroke} />
        <Circle cx={118} cy={92} r={4.2} fill={stroke} />
        <Ellipse cx={100} cy={108} rx={5.5} ry={4} fill={stroke} />
        <Path d="M100 113 V 120" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <Path d="M100 120 Q 94 124 90 121" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <Path d="M100 120 Q 106 124 110 121" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <Ellipse cx={68} cy={118} rx={7} ry={4} fill={blush} />
        <Ellipse cx={132} cy={118} rx={7} ry={4} fill={blush} />
      </G>
    );
  } else if (expression === 'happy') {
    face = (
      <G>
        <Path d="M76 92 Q 82 84 88 92" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <Path d="M112 92 Q 118 84 124 92" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <Ellipse cx={100} cy={108} rx={5.5} ry={4} fill={stroke} />
        <Path d="M100 113 V 118 M 100 118 Q 86 132 80 124 M 100 118 Q 114 132 120 124"
          stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <Path d="M93 125 Q 100 134 107 125 Q 100 130 93 125 Z"
          fill={tongue} stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" />
        <Ellipse cx={68} cy={120} rx={8} ry={4.5} fill={blush} />
        <Ellipse cx={132} cy={120} rx={8} ry={4.5} fill={blush} />
      </G>
    );
    extras = (
      <G>
        <G transform="rotate(-20, 160, 154)">
          <Path d="M150 156 Q 168 138 172 148 Q 174 156 162 158"
            fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        </G>
        <G stroke={stroke} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.9}>
          <Path d="M26 56 L 26 64 M 22 60 L 30 60" />
          <Path d="M178 50 L 178 58 M 174 54 L 182 54" />
        </G>
      </G>
    );
  } else if (expression === 'thinking') {
    face = (
      <G>
        <Circle cx={78} cy={90} r={4.5} fill={stroke} />
        <Circle cx={114} cy={90} r={4.5} fill={stroke} />
        <Ellipse cx={100} cy={108} rx={5.5} ry={4} fill={stroke} />
        <Path d="M100 113 V 119" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <Path d="M93 122 L 107 122" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <Ellipse cx={68} cy={118} rx={7} ry={4} fill={blush} />
        <Ellipse cx={132} cy={118} rx={7} ry={4} fill={blush} />
      </G>
    );
    extras = (
      <G>
        <Circle cx={172} cy={74} r={20} fill={accent} fillOpacity={0.22} stroke={stroke} strokeWidth={sw} />
        <Circle cx={172} cy={74} r={20} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
        <Line x1={186} y1={90} x2={200} y2={106} stroke={stroke} strokeWidth={sw + 1.2} strokeLinecap="round" />
      </G>
    );
  } else if (expression === 'listening') {
    face = (
      <G>
        <Circle cx={82} cy={92} r={4.2} fill={stroke} />
        <Circle cx={118} cy={92} r={4.2} fill={stroke} />
        <Ellipse cx={100} cy={108} rx={5.5} ry={4} fill={stroke} />
        <Ellipse cx={100} cy={122} rx={5} ry={6} fill={stroke} />
        <Ellipse cx={68} cy={118} rx={7} ry={4} fill={blush} />
        <Ellipse cx={132} cy={118} rx={7} ry={4} fill={blush} />
      </G>
    );
    extras = (
      <G fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round">
        <Path d="M10 96 Q 4 108 10 120" />
        <Path d="M22 88 Q 12 108 22 128" opacity={0.55} />
        <Path d="M190 96 Q 196 108 190 120" />
        <Path d="M178 88 Q 188 108 178 128" opacity={0.55} />
      </G>
    );
  } else if (expression === 'surprised') {
    face = (
      <G>
        <Circle cx={82} cy={90} r={8} fill="#fff" stroke={stroke} strokeWidth={2} />
        <Circle cx={118} cy={90} r={8} fill="#fff" stroke={stroke} strokeWidth={2} />
        <Circle cx={82} cy={91} r={3.5} fill={stroke} />
        <Circle cx={118} cy={91} r={3.5} fill={stroke} />
        <Ellipse cx={100} cy={108} rx={5.5} ry={4} fill={stroke} />
        <Ellipse cx={100} cy={126} rx={6.5} ry={8} fill={stroke} />
      </G>
    );
    extras = (
      <G fill={accent}>
        <Rect x={178} y={36} width={6} height={22} rx={3} />
        <Circle cx={181} cy={66} r={3.5} />
      </G>
    );
  } else if (expression === 'waving') {
    face = (
      <G>
        <Path d="M76 92 Q 82 84 88 92" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <Path d="M112 92 Q 118 84 124 92" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <Ellipse cx={100} cy={108} rx={5.5} ry={4} fill={stroke} />
        <Path d="M100 113 V 118 M 100 118 Q 88 130 84 124 M 100 118 Q 112 130 116 124"
          stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <Ellipse cx={68} cy={120} rx={8} ry={4.5} fill={blush} />
        <Ellipse cx={132} cy={120} rx={8} ry={4.5} fill={blush} />
      </G>
    );
    extras = (
      <G>
        <Path
          d="M160 138 C 178 124, 196 130, 192 148 C 198 156, 192 170, 180 168 C 174 176, 158 172, 156 158 Z"
          fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
        />
        <Circle cx={180} cy={142} r={2.5} fill={stroke} />
        <Circle cx={188} cy={148} r={2.5} fill={stroke} />
        <Circle cx={184} cy={156} r={2.5} fill={stroke} />
        <G stroke={stroke} strokeWidth={2.4} strokeLinecap="round" opacity={0.55}>
          <Path d="M198 118 L 206 112" />
          <Path d="M190 110 L 194 100" />
        </G>
      </G>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {Body}
      {face}
      {extras}
    </Svg>
  );
}
