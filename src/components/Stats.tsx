import React from 'react';
import { DailySummary } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Calendar, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { format, parseISO, subDays, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface StatsProps {
  summaries: DailySummary[];
}

export const Stats: React.FC<StatsProps> = ({ summaries }) => {
  // Prepare data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const summary = summaries.find(s => s.date === dateStr);
    return {
      date: format(date, 'MM/dd'),
      count: summary ? summary.totalCount : 0,
      fullDate: dateStr,
    };
  });

  const averageCount = Math.round(
    last7Days.reduce((acc, day) => acc + day.count, 0) / 7
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-2xl shadow-xl border border-brand-primary/10">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{payload[0].payload.date}</p>
          <p className="text-lg font-medium text-brand-primary">{payload[0].value} 次胎动</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 flex flex-col items-center justify-center text-center"
        >
          <div className="w-10 h-10 bg-brand-primary/5 rounded-full flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-brand-primary" />
          </div>
          <div className="text-2xl font-light serif text-brand-primary">{averageCount}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">日均胎动</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 flex flex-col items-center justify-center text-center"
        >
          <div className="w-10 h-10 bg-brand-primary/5 rounded-full flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-brand-primary" />
          </div>
          <div className="text-2xl font-light serif text-brand-primary">
            {summaries.length}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">记录天数</div>
        </motion.div>
      </div>

      {/* Chart Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            最近7天趋势
          </h3>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#9ca3af' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#9ca3af' }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(90, 90, 64, 0.03)' }} />
              <Bar dataKey="count" radius={[10, 10, 10, 10]} barSize={24}>
                {last7Days.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={isSameDay(parseISO(entry.fullDate), new Date()) ? '#5A5A40' : '#d1d1c1'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Analysis Info */}
      <div className="card p-6 bg-brand-primary/5 border border-brand-primary/10">
        <div className="flex gap-4">
          <div className="mt-1">
            <Info className="w-5 h-5 text-brand-primary" />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-brand-primary">关于胎动分析</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              通常建议在孕28周后开始计数。正常的胎动频率通常为每小时不少于3-5次，或12小时内不少于30次。
              <br />
              <span className="font-medium text-brand-primary italic">注意：每个宝宝的习惯不同，重要的是观察胎动的规律性。</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
