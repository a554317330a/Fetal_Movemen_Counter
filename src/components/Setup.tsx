import React, { useState } from 'react';
import { UserSettings } from '../types';
import { Baby, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface SetupProps {
  onComplete: (settings: UserSettings) => void;
}

export const Setup: React.FC<SetupProps> = ({ onComplete }) => {
  const [weeks, setWeeks] = useState<number>(28);
  const [days, setDays] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      refDate: Date.now(),
      refWeeks: weeks,
      refDays: days,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-8 card mt-12"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
          <Baby className="w-8 h-8 text-brand-primary" />
        </div>
        <h1 className="text-2xl font-semibold serif">欢迎使用萌动</h1>
        <p className="text-gray-500 text-sm mt-2">请先设置您当前的孕周，以便我们为您提供精准的分析</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">孕周 (周)</label>
            <input
              type="number"
              min="0"
              max="42"
              value={weeks}
              onChange={(e) => setWeeks(parseInt(e.target.value) || 0)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 text-lg font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">天数 (天)</label>
            <input
              type="number"
              min="0"
              max="6"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 0)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 text-lg font-medium"
            />
          </div>
        </div>

        <button type="submit" className="w-full olive-button py-4 text-lg font-medium flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5" />
          开始记录
        </button>
      </form>
    </motion.div>
  );
};
