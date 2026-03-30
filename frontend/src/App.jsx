import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Calculator, Leaf, DollarSign, Zap, Truck, BarChart3, Database } from 'lucide-react';
import './index.css';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  
  // Simulation Form State
  const [inv, setInv] = useState(50000);
  const [x1, setX1] = useState(120); // waste
  const [x2, setX2] = useState(60);  // energy
  const [x3, setX3] = useState(25);  // logistics
  const [roiResult, setRoiResult] = useState(null);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard();
    }
  }, [activeTab]);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dashboard`);
      setMetrics(res.data.metrics);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Dummy fallback if backend hasn't ingested data yet
      setMetrics({
        total_waste_kg: 0,
        total_energy_kwh: 0,
        total_logistics_saved: 0,
        total_financial_savings: 0
      });
    }
  };

  const calculateROI = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/roi`, {
        investment: inv,
        monthly_x1: x1,
        monthly_x2: x2,
        monthly_x3: x3
      });
      setRoiResult(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const dummyChartData = [
    { name: 'Ocak', savings: 100 },
    { name: 'Şubat', savings: 250 },
    { name: 'Mart', savings: 400 },
    { name: 'Nisan', savings: 750 },
    { name: 'Mayıs', savings: 1100 },
    { name: 'Haziran', savings: 1530 },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <Leaf className="logo-icon" size={32} />
          <span>Trace Impact</span>
        </div>
        <nav className="nav-links">
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} /> Alan İzleme Paneli
          </div>
          <div 
            className={`nav-item ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
          >
            <Calculator size={20} /> ROI Simülatörü
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="anim-fade-in">
            <header className="header">
              <h1>Genel Bakış</h1>
              <p>Kurumsal Atık Yönetimi ve Finansal Getiri Analizi</p>
            </header>
            
            <div className="metrics-grid">
              <div className="glass-panel metric-card">
                <div className="metric-icon"><Database size={24} /></div>
                <div className="metric-label">Toplam Atık (X₁)</div>
                <div className="metric-value">
                  {metrics?.total_waste_kg || 0} <span className="metric-unit">kg</span>
                </div>
              </div>
              
              <div className="glass-panel metric-card">
                <div className="metric-icon" style={{color: '#e3b341', background: 'rgba(227, 179, 65, 0.15)'}}>
                  <Zap size={24} />
                </div>
                <div className="metric-label">Enerji Tasarrufu (X₂)</div>
                <div className="metric-value">
                  {metrics?.total_energy_kwh || 0} <span className="metric-unit">kWh</span>
                </div>
              </div>

              <div className="glass-panel metric-card">
                <div className="metric-icon" style={{color: '#3b82f6', background: 'rgba(59, 130, 246, 0.15)'}}>
                  <Truck size={24} />
                </div>
                <div className="metric-label">Lojistik Maliyet Düşüşü (X₃)</div>
                <div className="metric-value">
                  {metrics?.total_logistics_saved || 0} <span className="metric-unit">$</span>
                </div>
              </div>

              <div className="glass-panel metric-card" style={{borderLeft: '4px solid #2ea043'}}>
                <div className="metric-icon" style={{color: '#2ea043', background: 'rgba(46, 160, 67, 0.15)'}}>
                  <DollarSign size={24} />
                </div>
                <div className="metric-label">Tahmini Finansal Tasarruf (Y)</div>
                <div className="metric-value" style={{color: '#2ea043'}}>
                  {parseFloat(metrics?.total_financial_savings || 0).toFixed(2)} <span className="metric-unit" style={{color: '#2ea043'}}>$</span>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{padding: '24px', height: '400px'}}>
              <h3 style={{marginBottom: '24px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <BarChart3 size={20}/> Kümülatif Tasarruf Eğilimi (ML Regresyon)
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dummyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#8b949e" />
                  <YAxis stroke="#8b949e" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="savings" stroke="#2ea043" strokeWidth={3} dot={{r: 4, fill: '#2ea043'}} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="anim-fade-in">
             <header className="header">
              <h1>ROI Simülatörü</h1>
              <p>Yatırım Maliyetlerinizi Akıllı Analitik Modeliyle Hesaplayın</p>
            </header>

            <div className="simulator-layout">
              <div className="glass-panel" style={{padding: '32px'}}>
                <form onSubmit={calculateROI}>
                  <div className="form-group">
                    <label>Toplam Altyapı Yatırımı ($) </label>
                    <input type="number" value={inv} onChange={e=>setInv(Number(e.target.value))} required />
                  </div>
                  
                  <h4 style={{marginTop: '24px', marginBottom: '16px', color: 'var(--accent-primary)'}}>Aylık Öngörülen Etkiler</h4>
                  
                  <div className="form-group">
                    <label>Aylık Ayrıştırılacak Toplam Atık (kg)</label>
                    <input type="number" value={x1} onChange={e=>setX1(Number(e.target.value))} required />
                  </div>
                  <div className="form-group">
                    <label>Aylık Beklenen Enerji Tasarrufu (kWh)</label>
                    <input type="number" value={x2} onChange={e=>setX2(Number(e.target.value))} required />
                  </div>
                  <div className="form-group">
                    <label>Aylık Lojistik Operasyon Düşüşü ($)</label>
                    <input type="number" value={x3} onChange={e=>setX3(Number(e.target.value))} required />
                  </div>

                  <button type="submit" className="btn-primary" style={{marginTop: '24px'}}>
                    <Calculator size={20} /> Regresyon Modelini Çalıştır
                  </button>
                </form>
              </div>

              <div className="glass-panel roi-result">
                <h3>Analiz Sonucu</h3>
                {roiResult ? (
                  <>
                    <div className="roi-circle">
                      <div className="roi-months">{roiResult.roi_months !== null && roiResult.roi_months !== Infinity ? roiResult.roi_months : '∞'}</div>
                      <div className="roi-label">Ayda Amorti</div>
                    </div>
                    <div style={{textAlign: 'center', marginTop: '16px'}}>
                      <p style={{color: 'var(--text-secondary)'}}>Modelin Öngördüğü Aylık Tasarruf (Y)</p>
                      <h2 style={{color: 'var(--accent-primary)', fontSize: '32px'}}>{roiResult.monthly_savings} $</h2>
                    </div>
                  </>
                ) : (
                  <p style={{color: 'var(--text-secondary)', textAlign: 'center'}}>
                    Sistemimize yatırım miktarını ve aylık hedefinizi girin; ekonometrik algoritmamız sizin için başa baş noktanızı (Break-even Point) hesaplasın.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
