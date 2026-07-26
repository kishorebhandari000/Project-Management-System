import logoDefault from '../../assets/logo.png';
import logoWhite from '../../assets/logo-white.png';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'default' | 'white';
}

export default function Logo({ size = 'medium', color = 'default' }: LogoProps) {
  const heights = {
    small: 'h-8',
    medium: 'h-10',
    large: 'h-14',
  };

  const src = color === 'white' ? logoWhite : logoDefault;

  return (
    <img
      src={src}
      alt="Project Management System"
      className={`${heights[size]} w-auto object-contain`}
    />
  );
}