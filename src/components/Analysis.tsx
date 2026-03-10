import React from 'react';
import { DailySummary, MovementRecord } from '../types';
import { ShieldCheck, AlertCircle, Info, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { format, isSameDay, parseISO } from 'date-fns';
import { cn } from '../lib/utils';

interface AnalysisProps {
  summaries: DailySummary[];
  currentWeeks: number;
}

export const Analysis: React.FC<AnalysisProps> = ({ summaries, currentWeeks }) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaySummary = summaries.find(s => s.date === todayStr);
  const todayRecords = todaySummary?.records || [];

  // Simple analysis logic
  // 1. Count per hour (if multiple records exist)
  // 2. Total count for the day
  
  const totalToday = todaySummary?.totalCount || 0;
  const isNormal = totalToday >= 10 || (todayRecords.length > 0 && totalToday / todayRecords.length >= 3);
  const isTooLow = totalToday > 0 && totalToday < 5;
  const isNoData = totalToday === 0;

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "card p-8 text-center flex flex-col items-center",
          isNormal && "bg-emerald-50 border border-emerald-100",
          isTooLow && "bg-amber-50 border border-amber-100",
          isNoData && "bg-gray-50 border border-gray-100"
        )}
      >
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-4",
          isNormal && "bg-emerald-100 text-emerald-600",
          isTooLow && "bg-amber-100 text-amber-600",
          isNoData && "bg-gray-100 text-gray-400"
        )}>
          {isNormal ? <ShieldCheck className="w-8 h-8" /> : 
           isTooLow ? <AlertCircle className="w-8 h-8" /> : 
           <Activity className="w-8 h-8" />}
        </div>

        <h3 className={cn(
          "text-xl font-semibold serif mb-2",
          isNormal && "text-emerald-800",
          isTooLow && "text-amber-800",
          isNoData && "text-gray-800"
        )}>
          {isNormal ? "胎动情况良好" : 
           isTooLow ? "胎动频率偏低" : 
           "今日暂无足够数据"}
        </h3>

        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
          {isNormal ? "您的宝宝今天很活泼，继续保持记录。请注意观察胎动的规律性。" : 
           isTooLow ? "今日记录的胎动次数较少。建议您换个姿势，喝点温水，静坐一小时再次观察。如持续偏低请咨询医生。" : 
           "请在宝宝活跃时进行记录，建议每天选择固定时间段进行计数。"}
        </p>
      </motion.div>

      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">分析依据</h4>
        
        <div className="card p-6 space-y-4">
          <div className="flex justify-between items-center pb-4 border-bottom border-gray-100">
            <span className="text-sm text-gray-500">当前孕周</span>
            <span className="font-medium text-brand-primary">{currentWeeks}周</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-bottom border-gray-100">
            <span className="text-sm text-gray-500">今日累计</span>
            <span className="font-medium text-brand-primary">{totalToday} 次</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">记录次数</span>
            <span className="font-medium text-brand-primary">{todayRecords.length} 次</span>
          </div>
        </div>
      </div>

      <div className="card p-6 bg-brand-primary/5 border border-brand-primary/10">
        <div className="flex gap-4">
          <div className="mt-1">
            <Info className="w-5 h-5 text-brand-primary" />
          </div>
          <div className="space-y-2 text-sm text-gray-600 leading-relaxed">
            <p className="font-semibold text-brand-primary">温馨提示</p>
            <p>1. 建议在餐后、睡前等宝宝活跃的时间段记录。</p>
            <p>2. 每次记录建议持续1小时。</p>
            <p>3. 胎动在28-32周达到高峰，38周后可能因空间变小而略微减少。</p>
            <p className="text-xs italic mt-2 text-gray-400">* 本分析仅供参考，不作为医疗诊断依据。如有不适请及时就医。</p>
          </div>
        </div>
      </div>
    </div>
  );
};
