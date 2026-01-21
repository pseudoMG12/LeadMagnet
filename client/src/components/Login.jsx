import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../utils/data';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ accessId: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, formData);
      if (res.data.success) {
        onLogin(res.data.token || true); // Accept token if provided, else just true
      }
    } catch (err) {
      console.error(err);
      setError('Access Denied: Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
        <div className="bg-[#050505] border border-white/10 rounded-2xl p-8 md:p-12 relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-3xl font-light text-white mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-white/40 text-sm mb-8">Secure Access Terminal</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Access ID</label>
                <input 
                  type="text"
                  value={formData.accessId}
                  onChange={(e) => setFormData({...formData, accessId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm font-light"
                  placeholder="Enter ID"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Password</label>
                <input 
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm font-light"
                  placeholder="Enter Password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-xs text-center">{error}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black rounded-lg py-3.5 text-sm font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
              >
                {loading ? 'Authenticating...' : 'Initialize Session'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="text-center mt-6">
           <p className="text-[10px] text-white/20 uppercase tracking-widest">LeadMagnet v1.0 • Secure Environment</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
