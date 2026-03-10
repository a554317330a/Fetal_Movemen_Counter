import React, { useState, useEffect, useMemo } from 'react';
import { UserSettings, MovementRecord, DailySummary } from './types';
import { Setup } from './components/Setup';
import { Counter } from './components/Counter';
import { Stats } from './components/Stats';
import { Analysis } from './components/Analysis';
import { calculateCurrentGestationalAge, formatGestationalAge } from './lib/utils';
import { format, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, BarChart2, ShieldCheck, Settings, Baby } from 'lucide-react';
import { cn } from './lib/utils';

const STORAGE_KEY_SETTINGS = 'fetal_counter_settings';
const STORAGE_KEY_RECORDS = 'fetal_counter_records';

export default function App() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [records, setRecords] = useState<MovementRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'counter' | 'stats' | 'analysis'>('counter');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    const savedRecords = localStorage.getItem(STORAGE_KEY_RECORDS);
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
    setIsInitialized(true);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (isInitialized) {
      if (settings) localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    }
  }, [settings, records, isInitialized]);

  const currentGA = useMemo(() => {
    if (!settings) return null;
    return calculateCurrentGestationalAge(
      new Date(settings.refDate),
      settings.refWeeks,
      settings.refDays
    );
  }, [settings]);

  const summaries = useMemo(() => {
    const dailyMap = new Map<string, DailySummary>();
    
    records.forEach(record => {
      const dateStr = format(record.timestamp, 'yyyy-MM-dd');
      const existing = dailyMap.get(dateStr) || { date: dateStr, totalCount: 0, records: [] };
      existing.totalCount += record.count;
      existing.records.push(record);
      dailyMap.set(dateStr, existing);
    });
    
    return Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [records]);

  const handleRecord = (record: MovementRecord) => {
    setRecords(prev => [record, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleResetSettings = () => {
    if (window.confirm('确定要重新设置孕周吗？记录的数据将保留。')) {
      setSettings(null);
    }
  };

  if (!isInitialized) return null;

  if (!settings) {
    return <Setup onComplete={setSettings} />;
  }

  return (
    <div className="min-h-screen bg-brand-bg pb-32">
      {/* Header */}
      <header className="bg-white px-6 py-8 border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center">
              <Baby className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold serif text-brand-primary">萌动</h1>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                孕 {formatGestationalAge(currentGA!)}
              </div>
            </div>
          </div>
          <button 
            onClick={handleResetSettings}
            className="p-2 text-gray-300 hover:text-brand-primary transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'counter' && (
              <Counter 
                onRecord={handleRecord} 
                recentRecords={records}
                onDelete={handleDeleteRecord}
              />
            )}
            {activeTab === 'stats' && (
              <Stats summaries={summaries} />
            )}
            {activeTab === 'analysis' && (
              <Analysis summaries={summaries} currentWeeks={currentGA!.weeks} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full p-2 flex items-center justify-between z-20">
        <NavButton 
          active={activeTab === 'counter'} 
          onClick={() => setActiveTab('counter')}
          icon={<Activity className="w-5 h-5" />}
          label="记录"
        />
        <NavButton 
          active={activeTab === 'stats'} 
          onClick={() => setActiveTab('stats')}
          icon={<BarChart2 className="w-5 h-5" />}
          label="统计"
        />
        <NavButton 
          active={activeTab === 'analysis'} 
          onClick={() => setActiveTab('analysis')}
          icon={<ShieldCheck className="w-5 h-5" />}
          label="分析"
        />
      </nav>
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 flex flex-col items-center gap-1 py-3 rounded-full transition-all relative",
      active ? "text-brand-primary" : "text-gray-400 hover:text-gray-600"
    )}
  >
    {active && (
      <motion.div 
        layoutId="nav-active"
        className="absolute inset-0 bg-brand-primary/5 rounded-full"
      />
    )}
    <div className="relative z-10">{icon}</div>
    <span className="text-[10px] font-semibold uppercase tracking-widest relative z-10">{label}</span>
  </button>
);
