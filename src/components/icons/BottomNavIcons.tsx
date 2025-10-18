import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  color?: string;
  size?: number;
  focused?: boolean;
}

// Home Icon SVG Component
export const HomeIcon: React.FC<IconProps> = ({
  color = '#4CAF50',
  size = 24,
  focused = false
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"
      fill={focused ? color : '#666'}
    />
  </Svg>
);

// Categories Icon SVG Component
export const CategoriesIcon: React.FC<IconProps> = ({
  color = '#4CAF50',
  size = 24,
  focused = false
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M11.074 4 8.442.408A.95.95 0 0 0 7.014.254L2.926 4h8.148ZM9 13v-1a4 4 0 0 1 4-4h6V6a1 1 0 0 0-1-1H1a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h17a1 1 0 0 0 1-1v-2h-6a4 4 0 0 1-4-4Z"
      fill={focused ? color : '#666'}
    />
    <Path
      d="M19 10h-6a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1Zm-4.5 3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM12.62 4h2.78L12.539.41a1.086 1.086 0 1 0-1.7 1.352L12.62 4Z"
      fill={focused ? color : '#666'}
    />
  </Svg>
);

// Products Icon SVG Component (Store/Shopping Bag)
export const ProductsIcon: React.FC<IconProps> = ({
  color = '#4CAF50',
  size = 24,
  focused = false
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M4 4V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2Zm2-2v2h8V2H6Zm8 4H6v8h8V6Z"
      fill={focused ? color : '#666'}
    />
  </Svg>
);

// Cart Icon SVG Component
export const CartNavIcon: React.FC<IconProps> = ({
  color = '#4CAF50',
  size = 24,
  focused = false
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M4 12.25V1m0 11.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M4 19v-2.25m6-13.5V1m0 2.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M10 19V7.75m6 4.5V1m0 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM16 19v-2"
      stroke={focused ? color : '#666'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Profile Icon SVG Component
export const ProfileIcon: React.FC<IconProps> = ({
  color = '#4CAF50',
  size = 24,
  focused = false
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"
      fill={focused ? color : '#666'}
    />
  </Svg>
);

// Sign In Icon SVG Component (for Auth tabs)
export const SignInIcon: React.FC<IconProps> = ({
  color = '#4CAF50',
  size = 24,
  focused = false
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M16 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2ZM4 4h12v2H4V4Zm0 4h12v8H4V8Z"
      fill={focused ? color : '#666'}
    />
    <Path
      d="M10 10v4m-2-2h4"
      stroke={focused ? color : '#666'}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);