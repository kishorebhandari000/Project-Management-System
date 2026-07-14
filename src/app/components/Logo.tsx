interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'default' | 'white';
}

export default function Logo({ size = 'medium', color = 'default' }: LogoProps) {
  const sizes = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-4xl',
  };

  const textColor = color === 'white' ? 'text-white' : 'text-[#2563a8]';
  const bgColor = color === 'white' ? 'bg-white' : 'bg-[#2563a8]';
  const iconTextColor = color === 'white' ? 'text-[#2563a8]' : 'text-white';

  return (
    <div className="flex items-center gap-3">
      {/* Icon */}
      <div className={`${bgColor} ${size === 'small' ? 'w-10 h-10' : size === 'medium' ? 'w-12 h-12' : 'w-16 h-16'} rounded-lg flex items-center justify-center`}>
        <span className={`${iconTextColor} font-bold ${size === 'small' ? 'text-lg' : size === 'medium' ? 'text-2xl' : 'text-3xl'}`}>
          P
        </span>
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <span className={`${textColor} font-bold ${sizes[size]} leading-none`}>
          {/* Renamed brand text from "PMS" to full name */}
          Project Management System
        </span>
        <span className={`${color === 'white' ? 'text-gray-300' : 'text-gray-600'} ${size === 'small' ? 'text-[10px]' : 'text-xs'} mt-0.5`}>
          Project Management
        </span>
      </div>
    </div>
  );
}
