import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface CartIconProps {
  size?: number;
  color?: string;
}

export const CartIcon: React.FC<CartIconProps> = ({
  size = 24,
  color = '#4CAF50'
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"
      fill={color}
    />
    <Circle cx="9" cy="9" r="1" fill={color} />
    <Circle cx="15" cy="9" r="1" fill={color} />
  </Svg>
);