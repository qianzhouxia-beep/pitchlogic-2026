import React, { useState, useMemo, useRef, useEffect, Suspense, lazy } from 'react';
import { 
  Zap, Target, Search, TrendingUp, BarChart3, SlidersHorizontal, Bell, 
  Settings, ChevronRight, Play, Cpu, Globe, Layers, MessageSquare, Send, Languages, ChevronDown,
  Activity, Trophy, Shield, Database, User, Filter, AlertTriangle, Lock, Star, History, LineChart,
  Menu, X
} from 'lucide-react';

const Spline = lazy(() => import('@splinetool/react-spline'));

// --- 全局后端 API 地址 ---
const API_BASE = "/api"; // 使用相对路径经过 Nginx 代理

// --- 权限等级 ---
const ROLES = {
  FREE: 'Free',
  MEMBER: 'Member',
  SUPREME: 'Supreme'
};

// --- AI 模型定义 ---
const AI_MODELS = [
  { id: 'steady', label: '稳健模型', desc: '低风险、高稳定', color: '#17eb17' },
  { id: 'data', label: '数据模型', desc: '纯历史统计推演', color: '#60a5fa' },
  { id: 'upset', label: '冷门模型', desc: '捕捉变盘与战意', color: '#f87171' },
  { id: 'live', label: '临场动态', desc: '赛前1小时数据修正', color: '#fbbf24' }
];

const FLAG_MAP = {
  'ARG': 'ar', 'FRA': 'fr', 'ENG': 'gb-eng', 'GER': 'de', 'BRA': 'br', 'ITA': 'it', 'ESP': 'es',
  'NED': 'nl', 'USA': 'us', 'MEX': 'mx', 'CAN': 'ca', 'PAN': 'pa', 'POL': 'pl', 'KSA': 'sa',
  'AUS': 'au', 'DEN': 'dk', 'TUN': 'tn', 'PER': 'pe', 'NGA': 'ng', 'IRN': 'ir', 'SRB': 'rs',
  'SUI': 'ch', 'CMR': 'cm', 'JPN': 'jp', 'CRC': 'cr', 'POR': 'pt', 'URU': 'uy', 'KOR': 'kr',
  'GHA': 'gh', 'BEL': 'be', 'CRO': 'hr', 'MAR': 'ma'
};

const getFlagUrl = (code, width = 160) => {
  const iso2 = FLAG_MAP[code.toUpperCase()];
  if (!iso2) return `https://flagcdn.com/w${width}/un.png`;
  return `https://flagcdn.com/w${width}/${iso2}.png`;
};

const App = () => {
  const [view, setView] = useState('landing'); // 'landing' or 'terminal'
  const [activeTab, setActiveTab] = useState('hub');
  const [userRole, setUserRole] = useState(ROLES.FREE);
  const [activeModel, setActiveModel] = useState(AI_MODELS[0]);
  const [liveMatch, setLiveMatch] = useState({
    teams: ["ARG", "FRA"], score: [3, 3], minute: 120,
    is_golden_hour: true, live_win_prob: 65,
    stats: { possession: [54, 46], xG: [3.24, 2.11], shots: [20, 10] }
  });
  const [fixtures, setFixtures] = useState({ upcoming: [], groups: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchRes, fixRes] = await Promise.all([
          fetch(`${API_BASE}/live-match`),
          fetch(`${API_BASE}/fixtures`)
        ]);
        if (matchRes.ok) setLiveMatch(await matchRes.json());
        if (fixRes.ok) setFixtures(await fixRes.json());
      } catch (e) { console.error("Data Syncing..."); }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (view === 'landing') {
    return (
      <div className="bg-hero-bg min-h-screen text-foreground font-sora selection:bg-primary selection:text-primary-foreground">
        <Navbar onEnter={() => setView('terminal')} />
        <HeroSection onEnter={() => setView('terminal')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sora selection:bg-primary selection:text-black antialiased">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[180px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[180px]" />
      </div>

      <div className="w-full max-w-md mx-auto h-screen flex flex-col relative z-10 px-4 pt-8 pb-24 overflow-hidden">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(23,235,23,0.33)]">
              <Shield size={18} className="text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black italic tracking-tighter">PITCHLOGIC</span>
              <span className="text-[6px] font-black text-primary tracking-[0.4em] uppercase">Sentinel V1.5</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Search size={18} className="text-white/40" />
            <Bell size={18} className="text-white/40" />
            <div className="bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[8px] font-black text-primary uppercase">
              {userRole.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar pb-10">
          <TerminalContent activeTab={activeTab} liveMatch={liveMatch} fixtures={fixtures} setActiveTab={setActiveTab} userRole={userRole} setUserRole={setUserRole} activeModel={activeModel} setActiveModel={setActiveModel} />
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[28px] p-1.5 flex justify-between items-center z-50 shadow-2xl">
          {[
            { id: 'hub', icon: Globe, label: '首页' },
            { id: 'data', icon: Database, label: '赛库' },
            { id: 'ai', icon: Zap, label: 'AI分析' },
            { id: 'center', icon: BarChart3, label: '数据' },
            { id: 'profile', icon: User, label: '我的' }
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`flex-1 flex flex-col items-center py-2.5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white/60'}`}
            >
              <item.icon size={18} />
              <span className="text-[8px] font-black mt-1 uppercase">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

// --- Navbar Component ---
const Navbar = ({ onEnter }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 lg:px-16 py-5">
      <div className="text-foreground text-xl font-semibold tracking-tight">SENTINEL</div>
      <div className="hidden md:flex gap-8 items-center">
        {["Services", "About Us", "Projects", "Team", "Contacts"].map((link) => (
          <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
            {link}
          </a>
        ))}
      </div>
      <button 
        onClick={onEnter}
        className="hidden md:inline-flex bg-nav-button hover:bg-nav-button/80 text-foreground transition-all active:scale-[0.97] rounded-lg uppercase text-xs tracking-widest px-6 h-10 items-center justify-center border border-white/5"
      >
        Get Started
      </button>
    </nav>
  );
};

// --- Hero Section Component ---
const HeroSection = ({ onEnter }) => {
  return (
    <section className="relative min-h-screen flex items-end bg-hero-bg overflow-hidden">
      {/* Spline 3D Background */}
      <div className="absolute inset-0">
        <Suspense fallback={<div className="absolute inset-0 bg-hero-bg" />}>
          <Spline 
            scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode" 
            className="w-full h-full"
          />
        </Suspense>
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30 z-[1] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 pointer-events-none w-full max-w-[90%] sm:max-w-md lg:max-w-2xl px-6 md:px-10 pb-10 md:pb-10 pt-32">
        <h1 className="animate-fade-up opacity-0 text-[clamp(3rem,8vw,6rem)] font-bold leading-[1.05] tracking-[-0.05em] text-foreground mb-2 md:mb-4 uppercase" style={{ animationDelay: "0.2s" }}>
          SENTINEL <span className="text-primary">AI</span>
        </h1>
        
        <p className="animate-fade-up opacity-0 text-foreground/80 text-[clamp(1.125rem,2.5vw,1.875rem)] font-light mb-3 md:mb-6" style={{ animationDelay: "0.4s" }}>
          Predicting sports correctly.
        </p>

        <p className="animate-fade-up opacity-0 text-muted-foreground text-[clamp(0.875rem,1.5vw,1.25rem)] font-light mb-4 md:mb-8" style={{ animationDelay: "0.55s" }}>
          Enterprise-grade football analytics deployed in real-time. AI-powered terminal for quantum edge. Built for the 2026 era of sports finance.
        </p>

        <div className="flex flex-wrap gap-3 font-bold animate-fade-up opacity-0" style={{ animationDelay: "0.7s" }}>
          <button 
            onClick={onEnter}
            className="pointer-events-auto bg-primary text-primary-foreground px-6 py-3 md:px-8 md:py-4 text-sm rounded-sm cursor-pointer hover:brightness-110 transition-all active:scale-[0.97] uppercase tracking-widest"
          >
            Enter Terminal
          </button>
          <button className="pointer-events-auto bg-white text-black px-6 py-3 md:px-8 md:py-4 text-sm rounded-sm cursor-pointer hover:brightness-90 transition-all active:scale-[0.97] uppercase tracking-widest">
            Whitepaper
          </button>
        </div>

        <p className="animate-fade-up opacity-0 text-muted-foreground/60 text-xs font-light mt-4 md:mt-6 uppercase tracking-widest" style={{ animationDelay: "0.85s" }}>
          Trusted partner. Singapore | Ohio. 125+ models deployed.
        </p>
      </div>
    </section>
  );
};

// --- Terminal Content Components ---
const TerminalContent = ({ activeTab, liveMatch, fixtures, setActiveTab, userRole, setUserRole, activeModel, setActiveModel }) => {
  switch (activeTab) {
    case 'hub': return <HomeModule t={liveMatch} f={fixtures} setTab={setActiveTab} />;
    case 'data': return <DatabaseModule f={fixtures} />;
    case 'ai': return <AIModule m={activeModel} setM={setActiveModel} role={userRole} t={liveMatch} />;
    case 'center': return <DataCenterModule />;
    case 'profile': return <ProfileModule role={userRole} setRole={setUserRole} />;
    default: return <HomeModule />;
  }
};

const HomeModule = ({ t, f, setTab }) => (
  <div className="animate-fade-up">
    <div className="bg-white/5 rounded-3xl p-5 border border-white/10 mb-6 backdrop-blur-md">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black text-primary tracking-widest uppercase">AI 精选推荐</span>
        <Star size={14} className="text-primary fill-primary" />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={getFlagUrl(t.teams[0])} className="w-10 h-7 rounded shadow-lg object-cover" />
          <span className="text-sm font-black italic">{t.teams[0]}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-black italic text-primary">{t.live_win_prob}%</span>
          <span className="text-[6px] font-black text-white/30 uppercase">Win Prob</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-black italic">{t.teams[1]}</span>
          <img src={getFlagUrl(t.teams[1])} className="w-10 h-7 rounded shadow-lg object-cover" />
        </div>
      </div>
    </div>

    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
      {['五大联赛', '欧冠', '中超', '日韩'].map(l => (
        <button key={l} className="whitespace-nowrap bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black hover:bg-white/10 transition-colors">
          {l}
        </button>
      ))}
    </div>

    <div className="flex justify-between items-center mb-4 px-1">
      <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">今日赛程</span>
      <button onClick={() => setTab('data')} className="text-[8px] font-black text-primary hover:underline uppercase">全部</button>
    </div>
    
    <div className="space-y-3">
      {(f.upcoming || []).map((match, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-[8px] font-black text-white/20 italic">{match.time}</span>
            <span className="text-xs font-black italic tracking-tight">{match.teams[0]} VS {match.teams[1]}</span>
          </div>
          <ChevronRight size={14} className="text-white/20" />
        </div>
      ))}
    </div>
  </div>
);

const DatabaseModule = ({ f }) => (
  <div className="animate-fade-up">
    <div className="flex gap-2 mb-6">
      <FilterBtn label="联赛" active />
      <FilterBtn label="热门" />
      <FilterBtn label="冷门" />
    </div>
    <div className="space-y-3">
      {(f.upcoming || []).map((match, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <span className="text-[8px] font-black text-white/30">{match.time}</span>
             <span className="text-xs font-black italic">{match.teams[0]} VS {match.teams[1]}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[8px] font-black text-primary uppercase">AI Recommend</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AIModule = ({ m, setM, role, t }) => (
  <div className="animate-fade-up h-full flex flex-col">
    <div className="flex bg-white/5 rounded-2xl p-1 mb-6 border border-white/10">
      {AI_MODELS.map(model => (
        <button 
          key={model.id} 
          onClick={() => setM(model)}
          className={`flex-1 py-2 rounded-xl text-[8px] font-black transition-all ${m.id === model.id ? 'bg-white/10 text-white' : 'text-white/20'}`}
        >
          {model.label}
        </button>
      ))}
    </div>

    <div className="flex-1 space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">胜平负概率</span>
          <div className="px-2 py-1 bg-primary/10 rounded border border-primary/30 text-[8px] font-black text-primary">
            {m.label}
          </div>
        </div>
        <div className="flex h-12 gap-1 mb-8">
           <ProbBar label="主胜" val={t.live_win_prob} color="#17eb17" />
           <ProbBar label="平局" val={20} color="#60a5fa" />
           <ProbBar label="客胜" val={100 - t.live_win_prob - 20} color="#f87171" />
        </div>

        {role === ROLES.FREE && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <Lock size={24} className="text-primary mb-3" />
            <h4 className="text-xs font-black italic mb-1 text-white uppercase tracking-tighter">Unlock Pro Analytics</h4>
            <p className="text-[8px] font-black text-white/40 mb-4 uppercase tracking-widest">至尊会员解锁首发阵容、资金流向及避雷预警</p>
            <button className="bg-primary text-black px-6 py-2 rounded-xl text-[10px] font-black shadow-lg uppercase tracking-widest transition-transform active:scale-95">Upgrade Now</button>
          </div>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
         <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} className="text-yellow-400" />
            <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">避雷预警 (至尊专享)</span>
         </div>
         <div className={`space-y-2 ${role !== ROLES.SUPREME ? 'blur-sm grayscale' : ''}`}>
            <p className="text-[9px] font-black text-white/60 leading-relaxed italic">
              ※ 主队前锋核心伤停，历史同盘口下主胜率仅为 24%。<br/>
              ※ 市场资金目前 70% 涌入平局，警惕变盘风险。
            </p>
         </div>
      </div>
    </div>
  </div>
);

const DataCenterModule = () => (
  <div className="space-y-4 animate-fade-up">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center">
        <Activity size={18} className="mb-2 text-red-400" />
        <span className="text-[7px] font-black text-white/20 uppercase">核心伤停</span>
        <span className="text-sm font-black italic text-red-400">12</span>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center">
        <LineChart size={18} className="mb-2 text-yellow-400" />
        <span className="text-[7px] font-black text-white/20 uppercase">指数异常</span>
        <span className="text-sm font-black italic text-yellow-400">HIGH</span>
      </div>
    </div>
    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-sm">
      <span className="text-[10px] font-black text-white/40 uppercase mb-4 block tracking-widest">实时盘口监控</span>
      <div className="space-y-4">
        <OddRow agency="Bet365" open="1.25 / 4.0 / 8.0" now="1.30 / 4.2 / 7.5" up />
        <OddRow agency="Pinnacle" open="1.22 / 4.1 / 8.5" now="1.28 / 4.3 / 7.2" up />
      </div>
    </div>
  </div>
);

const ProfileModule = ({ role, setRole }) => (
  <div className="animate-fade-up">
    <div className="flex items-center gap-4 mb-8">
      <div className="w-16 h-16 bg-white/10 rounded-3xl border border-white/10 flex items-center justify-center">
        <User size={32} className="text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-black italic leading-none mb-2">Reed Master</h3>
        <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-widest">{role} Member</span>
      </div>
    </div>

    <div className="bg-gradient-to-r from-primary/20 to-transparent p-5 rounded-3xl border border-primary/20 mb-8 backdrop-blur-sm">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xs font-black italic">PRO ACCESS</span>
          <span className="text-[8px] font-black text-white/40 uppercase mt-1">Unlock 100% AI Quantum Engine</span>
        </div>
        <button 
          onClick={() => setRole(ROLES.SUPREME)}
          className="bg-primary text-black px-4 py-2 rounded-xl text-[10px] font-black transition-transform active:scale-95"
        >
          UPGRADE
        </button>
      </div>
    </div>

    <div className="space-y-2">
      <MenuRow icon={Star} label="我的收藏" />
      <MenuRow icon={History} label="历史订单" />
      <MenuRow icon={Settings} label="系统设置" />
    </div>
  </div>
);

const FilterBtn = ({ label, active }) => (
  <button className={`px-4 py-1.5 rounded-xl text-[8px] font-black border transition-all ${active ? 'bg-primary text-black border-primary' : 'bg-transparent text-white/40 border-white/10'}`}>
    {label}
  </button>
);

const OddRow = ({ agency, open, now, up }) => (
  <div className="flex justify-between items-center text-[10px]">
    <span className="font-black text-white/40">{agency}</span>
    <div className="flex gap-4 font-mono">
      <span className="font-black text-white/20">初 {open}</span>
      <span className={`font-black ${up ? 'text-red-400' : 'text-primary'}`}>即 {now}</span>
    </div>
  </div>
);

const MenuRow = ({ icon: Icon, label }) => (
  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-white/40" />
      <span className="text-xs font-black italic">{label}</span>
    </div>
    <ChevronRight size={14} className="text-white/20" />
  </div>
);

const ProbBar = ({ label, val, color }) => (
  <div className="flex-1 flex flex-col items-center">
    <div className="w-full bg-white/5 rounded-t-lg h-full relative overflow-hidden flex items-end">
      <div className="w-full bg-current opacity-40 rounded-t-sm transition-all duration-700" style={{ height: `${val}%`, color }} />
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black italic">{val}%</span>
    </div>
    <span className="text-[7px] font-black text-white/30 mt-2 uppercase">{label}</span>
  </div>
);

export default App;
