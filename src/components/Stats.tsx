import React, { useState } from 'react';
import { DailySummary } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Calendar, Info, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO, subDays, isSameDay } from 'date-fns';
import { GoogleGenAI } from "@google/genai";

interface StatsProps {
  summaries: DailySummary[];
  gestationalAge: { weeks: number; days: number };
}

export const Stats: React.FC<StatsProps> = ({ summaries, gestationalAge }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeData = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `
        我是一名孕妇，当前孕周是 ${gestationalAge.weeks} 周 ${gestationalAge.days} 天。
        我最近 7 天的胎动记录如下（每天的总次数）：
        ${last7Days.map(d => `${d.date}: ${d.count}次`).join('\n')}
        
        请帮我分析一下这个胎动数据是否正常？
        如果数据较少，请提醒我如何正确计数。
        如果数据有异常趋势，请给出温和的建议。
        请用亲切、专业的语气回答，字数在 200 字以内。
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiAnalysis(response.text || "暂时无法获取分析结果，请稍后再试。");
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setAiAnalysis("分析服务暂时不可用，请参考下方的医学建议。");
    } finally {
      setIsAnalyzing(false);
    }
  };
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

  const totalInLast7Days = last7Days.reduce((acc, day) => acc + day.count, 0);
  
  // Calculate how many days to divide by: 
  // Either 7, or the number of days since the very first record (if less than 7)
  const firstRecordDate = summaries.length > 0 
    ? parseISO([...summaries].sort((a, b) => a.date.localeCompare(b.date))[0].date) 
    : new Date();
  
  const diffInMs = new Date().setHours(0,0,0,0) - firstRecordDate.setHours(0,0,0,0);
  const daysSinceStart = Math.max(1, Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1);
  const divisor = Math.min(7, daysSinceStart);

  const averageCount = Math.round(totalInLast7Days / divisor);

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

      {/* AI Analysis Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card p-6 bg-gradient-to-br from-brand-primary/10 to-transparent border border-brand-primary/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-primary" />
            <h3 className="font-semibold text-brand-primary">AI 智能分析</h3>
          </div>
          <button
            onClick={analyzeData}
            disabled={isAnalyzing}
            className="text-xs font-medium bg-brand-primary text-white py-2 px-4 rounded-full flex items-center gap-2 hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
            {aiAnalysis ? "重新分析" : "开始分析"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 text-center text-sm text-gray-400 italic"
            >
              正在深度分析您的胎动规律...
            </motion.div>
          ) : aiAnalysis ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-sm text-gray-600 leading-relaxed bg-white/50 p-4 rounded-2xl border border-white"
            >
              {aiAnalysis}
            </motion.div>
          ) : (
            <div className="text-sm text-gray-400">
              点击上方按钮，AI 将结合您的孕周和最近 7 天的数据为您提供个性化建议。
            </div>
          )}
        </AnimatePresence>
      </motion.div>

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
