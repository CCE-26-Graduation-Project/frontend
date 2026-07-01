import React from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SportswearIcon } from './SportswearIcon';

export type IconName =
  | 'search' | 'mic' | 'camera' | 'home' | 'bookmark' | 'bell' | 'user'
  | 'back' | 'forward' | 'close' | 'filter' | 'sort' | 'grid' | 'list'
  | 'clock' | 'flame' | 'trending' | 'folder' | 'globe' | 'pin' | 'check'
  | 'plus' | 'chevronRight' | 'chevronDown' | 'refresh' | 'star' | 'waveform'
  | 'image' | 'tag' | 'bag' | 'book' | 'sparkles' | 'swap'
  | 'shirt' | 'shoe' | 'sofa' | 'fridge' | 'ball' | 'car' | 'sportswear';

type FeatherName = React.ComponentProps<typeof Feather>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const FEATHER: Partial<Record<IconName, FeatherName>> = {
  search: 'search',
  mic: 'mic',
  camera: 'camera',
  home: 'home',
  bookmark: 'bookmark',
  bell: 'bell',
  user: 'user',
  back: 'arrow-left',
  forward: 'arrow-right',
  close: 'x',
  filter: 'sliders',
  sort: 'bar-chart-2',
  grid: 'grid',
  list: 'list',
  clock: 'clock',
  flame: 'zap',
  trending: 'trending-up',
  folder: 'folder',
  globe: 'globe',
  pin: 'map-pin',
  check: 'check',
  plus: 'plus',
  chevronRight: 'chevron-right',
  chevronDown: 'chevron-down',
  refresh: 'refresh-cw',
  star: 'star',
  waveform: 'activity',
  image: 'image',
  tag: 'tag',
  bag: 'shopping-bag',
  book: 'book',
  sparkles: 'zap',
  swap: 'shuffle',
};

const MCI: Partial<Record<IconName, MCIName>> = {
  shirt: 'tshirt-crew',
  shoe: 'shoe-sneaker',
  sofa: 'sofa',
  fridge: 'fridge',
  ball: 'basketball',
  car: 'car',
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 22, color = '#1E2B4D' }: IconProps) {
  if (name === 'sportswear') {
    return <SportswearIcon size={size} color={color} />;
  }
  const mciName = MCI[name];
  if (mciName) {
    return <MaterialCommunityIcons name={mciName} size={size} color={color} />;
  }
  const featherName = FEATHER[name] ?? 'help-circle';
  return <Feather name={featherName} size={size} color={color} />;
}
