import React, { useState, useEffect, useMemo } from 'react';
import { MovementRecord } from '../types';
import { Activity, History, Trash2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface CounterProps {
  onRecord: (record: MovementRecord) => void;
  recentRecords: MovementRecord[];
  onDelete: (id: string) => void;
}

export const Counter: React.FC<CounterProps> = ({ onRecord, recentRecords, onDelete }) => {
  const [showCooldown, setShowCooldown] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Update "now" every second to refresh "time since" displays
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Find the active session (the most recent record if it's less than 1 hour old)
  const activeSession = useMemo(() => {
    if (recentRecords.length === 0) return null;
    const last = recentRecords[0];
    const oneHourAgo = now - 60 * 60 * 1000;
    return last.timestamp > oneHourAgo ? last : null;
  }, [recentRecords, now]);

  const timeSinceLastKick = useMemo(() => {
    if (recentRecords.length === 0) return null;
    return Math.floor((now - recentRecords[0].timestamp) / 1000);
  }, [recentRecords, now]);

  const incrementCount = () => {
    const currentTime = Date.now();
    
    // 5-minute cooldown rule
    if (recentRecords.length > 0) {
      const lastKickTime = recentRecords[0].timestamp;
      if (currentTime - lastKickTime < 5 * 60 * 1000) {
        setShowCooldown(true);
        setTimeout(() => setShowCooldown(false), 2000);
        return;
      }
    }

    if (activeSession) {
      // Update existing session
      onRecord({
        ...activeSession,
        count: activeSession.count + 1,
        timestamp: currentTime,
      });
    } else {
      // Start new session
      onRecord({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: currentTime,
        count: 1,
        recordedBy: 'wife',
      });
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒前`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    return `${hours}小时前`;
  };

  return (
    <div className="space-y-6">
      {/* Main Counter Card */}
      <motion.div 
        layout
        className="card p-8 flex flex-col items-center relative overflow-hidden"
      >
        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <Activity className={cn("w-4 h-4", activeSession && "animate-pulse text-brand-primary")} />
          <span className="text-sm font-medium uppercase tracking-widest">
            {activeSession ? "当前活跃期" : "点击下方按钮记录胎动"}
          </span>
        </div>

        <div className="text-7xl font-light serif mb-4 flex items-baseline gap-2">
          {activeSession ? activeSession.count : 0}
          <span className="text-xl text-gray-400">次</span>
        </div>

        <div className="h-6 mb-8">
          {timeSinceLastKick !== null && (
            <div className="text-sm text-gray-400 font-medium">
              距离上次胎动: <span className="text-brand-primary">{formatDuration(timeSinceLastKick)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-4 w-full relative">
          <button
            onClick={incrementCount}
            className="flex-1 olive-button py-6 text-xl font-medium flex items-center justify-center gap-3 shadow-lg shadow-brand-primary/20"
          >
            <Heart className={cn("w-6 h-6", activeSession && "animate-bounce")} />
            记录一次
          </button>

          <AnimatePresence>
            {showCooldown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-12 left-0 right-0 text-center"
              >
                <div className="bg-brand-primary text-white text-xs py-2 px-4 rounded-full inline-flex items-center gap-2 shadow-lg">
                  <Activity className="w-3 h-3" />
                  5分钟内的连续胎动计为一次
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                      <div className="text-xs text-gray-400">
                        {format(record.timestamp, 'HH:mm')} · {record.recordedBy === 'wife' ? '准妈妈' : '准爸爸'} 记录
                      </div>
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
