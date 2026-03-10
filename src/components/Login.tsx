import React, { useState } from 'react';
import { UserRole } from '../types';
import { Lock, User, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123456' && role) {
      onLogin(role);
    } else if (password !== '123456') {
      setError('密码错误');
    } else if (!role) {
      setError('请选择您的身份');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto p-8 card mt-20"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-brand-primary" />
        </div>
        <h1 className="text-2xl font-semibold serif">欢迎回来</h1>
        <p className="text-gray-500 text-sm mt-2">请输入密码并选择您的身份</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">身份</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('wife')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                role === 'wife' 
                  ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' 
                  : 'border-gray-100 text-gray-400 hover:border-brand-primary/30'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="font-medium">准妈妈</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('husband')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                role === 'husband' 
                  ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' 
                  : 'border-gray-100 text-gray-400 hover:border-brand-primary/30'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="font-medium">准爸爸</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">进入密码</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="请输入密码"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 text-lg"
            />
          </div>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm text-center font-medium"
          >
            {error}
          </motion.p>
        )}

        <button 
          type="submit" 
          className="w-full olive-button py-4 text-lg font-medium shadow-lg shadow-brand-primary/20"
        >
          进入系统
        </button>
      </form>
    </motion.div>
  );
};
