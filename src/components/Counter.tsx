import React, { useState, useEffect, useRef } from 'react';
import { MovementRecord } from '../types';
import { Timer, Activity, History, Trash2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface CounterProps {
  onRecord: (record: MovementRecord) => void;
  recentRecords: MovementRecord[];
  onDelete: (id: string) => void;
}

export const Counter: React.FC<CounterProps> = ({ onRecord, recentRecords, onDelete }) => {
  const [isCounting, setIsCounting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isCounting && startTime) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCounting, startTime]);

  const startSession = () => {
    setIsCounting(true);
    setStartTime(Date.now());
    setCount(0);
    setElapsed(0);
  };

  const incrementCount = () => {
    if (!isCounting) startSession();
    setCount(prev => prev + 1);
  };

  const stopSession = () => {
    if (count > 0) {
      onRecord({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        count: count,
      });
    }
    setIsCounting(false);
    setStartTime(null);
    setCount(0);
    setElapsed(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Main Counter Card */}
      <motion.div 
        layout
        className="card p-8 flex flex-col items-center relative overflow-hidden"
      >
        {isCounting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-0 left-0 w-full h-1 bg-brand-primary/20"
          >
            <motion.div 
              className="h-full bg-brand-primary"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3600, ease: "linear" }} // 1 hour max
            />
          </motion.div>
        )}

        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <Timer className={cn("w-4 h-4", isCounting && "animate-pulse text-brand-primary")} />
          <span className="text-sm font-medium uppercase tracking-widest">
            {isCounting ? "正在计时" : "点击下方按钮开始记录"}
          </span>
        </div>

        <div className="text-7xl font-light serif mb-8 flex items-baseline gap-2">
          {count}
          <span className="text-xl text-gray-400">次</span>
        </div>

        {isCounting && (
          <div className="text-2xl font-mono text-brand-primary mb-8">
            {formatTime(elapsed)}
          </div>
        )}

        <div className="flex gap-4 w-full">
          <button
            onClick={incrementCount}
            className="flex-1 olive-button py-6 text-xl font-medium flex items-center justify-center gap-3 shadow-lg shadow-brand-primary/20"
          >
            <Heart className={cn("w-6 h-6", isCounting && "animate-bounce")} />
            记录一次
          </button>
          
          {isCounting && (
            <button
              onClick={stopSession}
              className="px-8 bg-white border-2 border-brand-primary/20 text-brand-primary rounded-full font-medium hover:bg-brand-primary/5 transition-colors"
            >
              结束
            </button>
          )}
        </div>
      </motion.div>

      {/* Recent Records */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4" />
            最近记录
          </h3>
        </div>
        
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {recentRecords.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center text-gray-400 text-sm italic"
              >
                暂无记录，开始您的第一次胎动计数吧
              </motion.div>
            ) : (
              recentRecords.slice(0, 5).map((record) => (
                <motion.div
                  key={record.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card p-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-primary/5 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{record.count} 次胎动</div>
                      <div className="text-xs text-gray-400">{format(record.timestamp, 'HH:mm')}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDelete(record.id)}
                    className="p-2 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
