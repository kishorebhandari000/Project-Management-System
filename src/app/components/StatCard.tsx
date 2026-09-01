import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion, animate } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  to?: string;
  accent?: 'default' | 'warning';
  delay?: number;
  hint?: React.ReactNode;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 0.7,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [value]);

  return <>{display}</>;
}

export default function StatCard({ icon: Icon, label, value, to, accent = 'default', delay = 0, hint }: StatCardProps) {
  const isNumeric = typeof value === 'number';
  const iconBadgeClass =
    accent === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-[#2563a8]/10 text-[#2563a8]';
  const valueClass = accent === 'warning' ? 'text-orange-600' : '';

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="h-full bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-gray-600 flex items-center">
          {label}
          {hint}
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBadgeClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className={`text-3xl ${valueClass}`}>{isNumeric ? <AnimatedNumber value={value} /> : value}</div>
    </motion.div>
  );

  if (to) {
    return (
      <Link to={to} className="block h-full focus:outline-none focus:ring-2 focus:ring-[#2563a8] rounded-lg">
        {card}
      </Link>
    );
  }

  return card;
}
