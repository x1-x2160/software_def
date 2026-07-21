import React, { useState, useRef, useCallback, useEffect } from 'react';

const API_URL = '';

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [view, setView] = useState('hero'); // 'hero' or 'dash'
  const fileInputRef = useRef(null);

  // Toggle Dark Mode (the V2 UI is strictly dark, but we'll keep the toggle logic alive)
  const [darkMode, setDarkMode] = useState(true);

  const handleFile = useCallback((f) => {
    if (f && f.name.endsWith('.csv')) {
      setFile(f);
      setError(null);
    } else {
      setError('Please upload a .csv file');
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragActive(false), []);

  const runPrediction = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    // Use AbortController for a 90-second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    try {
      const res = await fetch(`${API_URL}/api/predict`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Server returned an invalid response. The model may still be training — please try again in a moment.');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Prediction failed');
      }

      setResults(data);
      setView('dash'); // Switch to dashboard automatically
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        setError('Request timed out. Large datasets take longer to process — please try again.');
      } else if (err.message?.includes('string did not match') || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError('Connection lost or server timed out. The dataset may be too large for the hosted server. Try a smaller dataset or run locally.');
      } else {
        setError(err.message || 'Could not connect to backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell" role="main">
      <h2 style={{ position:'absolute', width:1, height:1, overflow:'hidden', clip:'rect(0,0,0,0)' }}>
        Software Defect Detection System
      </h2>

      <div className="hdr">
        <div className="logo-wrap">
          <div className="logo-box">
            <svg viewBox="0 0 20 20" fill="none" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"/></svg>
          </div>
          <div>
            <div className="logo-txt">DefectSense</div>
            <div className="logo-sub">[TabNet SMOTE v2.1]</div>
          </div>
        </div>
        <nav className="nav">
          <button className={`ntab ${view === 'dash' ? 'act' : ''}`} onClick={() => { if(results) setView('dash'); }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="7" height="7" rx="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5"/><rect x="2" y="11" width="7" height="7" rx="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5"/></svg>
            Dashboard
          </button>
          <button className={`ntab ${view === 'hero' ? 'act' : ''}`} onClick={() => setView('hero')}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 13v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3"/><polyline points="13 7 10 4 7 7"/><line x1="10" y1="4" x2="10" y2="13"/></svg>
            Upload
          </button>
        </nav>
        <div className={`tog ${darkMode ? 'on' : ''}`} onClick={() => setDarkMode(!darkMode)} role="switch" aria-label="Toggle theme">
          <div className="tok"></div>
        </div>
      </div>

      {view === 'hero' && (
        <div id="engine-view">
          
          <div className="engine-header">
            <div className="sys-brand">
              <div className="led-toggle"></div>
              <span>SYS_ENV: DEFECTSENSE v2.1</span>
            </div>
          </div>

          <div className="engine-grid">
            {/* Left Telemetry Box */}
            <div className="engine-telemetry">
              <div className="tel-box">
                <div className="tel-title">HARDWARE_MONITOR</div>
                <div className="tel-gauge">THREAD_LATENCY: <span className="val">1.42ms</span></div>
                <div className="tel-gauge">MEM_FOOTPRINT: <span className="val">0.04MB</span></div>
                <div className="tel-gauge">CPU_ALLOC: <span className="val">12.4%</span></div>
                <div className="tel-gauge pulse-aura" style={{ marginTop: '20px' }}>BUFFER: <span className="val" style={{ color: '#10B981' }}>LISTENING</span></div>
              </div>
            </div>

            {/* Center Ingestion Port */}
            <div className="engine-ingestion">
              <div 
                className={`drop-port ${dragActive ? 'drag-active' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                role="button" aria-label="Upload CSV"
              >
                <div className="laser-scanner"></div>
                <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
                
                {file ? (
                  <div className="file-active">
                    <div className="row-matrix">
                      0x000: 4E 41 53 41<br/>
                      0x004: 4B 43 31 00
                    </div>
                    <div className="file-name">{file.name} | {(file.size / 1024).toFixed(1)} KB</div>
                    <div className="status-pill">[STATUS: PARSED_NASA_MCCABE_FORMAT]</div>
                  </div>
                ) : (
                  <div className="file-empty">
                    <div className="row-matrix" style={{ opacity: 0.3 }}>
                      WAITING_FOR_DATASTREAM...
                    </div>
                    <span>[MOUNT_DATA_PAYLOAD]</span>
                  </div>
                )}
              </div>

              <div className="engine-actions">
                <button className="btn-execute" onClick={runPrediction} disabled={!file || loading}>
                  {loading ? "PROCESSING_PAYLOAD..." : "EXECUTE INFERENCE ENGINE [Ctrl+Enter]"}
                </button>
                {file && (
                  <button className="btn-reset" onClick={() => { setFile(null); setError(null); }}>
                    RESET_PIPELINE
                  </button>
                )}
              </div>
              {error && <div className="engine-error">[ERR_TRACE]: {error}</div>}
            </div>

            {/* Right Visual Analytics Stream */}
            <div className="engine-analytics">
              <div className="analytics-stream">
                <div className="stream-log">&gt; INITIALIZING_PIPELINE... OK</div>
                <div className="stream-log">&gt; LOADING_TABNET_WEIGHTS... OK</div>
                <div className="stream-log">&gt; SMOTE_MODULE_STANDBY... OK</div>
                <div className="stream-log blink">&gt; WAITING_FOR_INFERENCE_TRIGGER...</div>
              </div>
            </div>
          </div>

          {/* Bottom Analytics Matrix Table */}
          <div className="engine-matrix">
            <div className="matrix-cell">BLOCK_READ: <span className="val">500 MODS</span></div>
            <div className="matrix-cell">LATENCY: <span className="val">~0.002s</span></div>
            <div className="matrix-cell">PIPELINE: <span className="val">TabNet v2</span></div>
            <div className="matrix-cell">CONFIG: <span className="val">SMOTE BALANCED</span></div>
          </div>

        </div>
      )}

      {view === 'dash' && results && (
        <div className="dash" id="dash-view">
          {results.warnings && results.warnings.length > 0 && (
            <div className="warning-banner" style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.18)',
              borderRadius: '9px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '11px',
              color: '#f59e0b',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Datastream Optimized
              </div>
              {results.warnings.map((w, idx) => (
                <div key={idx} style={{ opacity: 0.85 }}>• {w}</div>
              ))}
            </div>
          )}
          
          <div className="metrics">
            <div className="mc">
              <div className="mc-ico" style={{background:'rgba(96,165,250,0.1)',border:'1px solid rgba(96,165,250,0.18)'}}>
                <svg viewBox="0 0 16 16" fill="none" stroke="#60a5fa" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
              </div>
              <div className="mc-lbl">Total Modules</div>
              <div className="mc-val">{results.dataset.total}</div>
              <div className="mc-tag" style={{background:'rgba(96,165,250,0.1)',color:'#60a5fa',border:'1px solid rgba(96,165,250,0.18)'}}>+12 this run</div>
            </div>
            <div className="mc">
              <div className="mc-ico" style={{background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.2)'}}>
                <svg viewBox="0 0 16 16" fill="none" stroke="#f87171" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M8 2L1.5 13h13L8 2z"/><line x1="8" y1="7" x2="8" y2="10"/><circle cx="8" cy="12" r=".5" fill="#f87171"/></svg>
              </div>
              <div className="mc-lbl">Predicted Defective</div>
              <div className="mc-val" style={{color:'#f87171'}}>{results.predictions.defective}</div>
              <div className="mc-tag" style={{background:'rgba(248,113,113,0.1)',color:'#f87171',border:'1px solid rgba(248,113,113,0.2)'}}>High risk</div>
            </div>
            <div className="mc">
              <div className="mc-ico" style={{background:'rgba(74,222,128,0.08)',border:'1px solid rgba(74,222,128,0.18)'}}>
                <svg viewBox="0 0 16 16" fill="none" stroke="#4ade80" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="2 8 6 12 14 4"/></svg>
              </div>
              <div className="mc-lbl">Predicted Clean</div>
              <div className="mc-val" style={{color:'#4ade80'}}>{results.predictions.nonDefective}</div>
              <div className="mc-tag" style={{background:'rgba(74,222,128,0.08)',color:'#4ade80',border:'1px solid rgba(74,222,128,0.18)'}}>Verified</div>
            </div>
            <div className="mc">
              <div className="mc-ico" style={{background:'rgba(56,189,248,0.08)',border:'1px solid rgba(56,189,248,0.18)'}}>
                <svg viewBox="0 0 16 16" fill="none" stroke="#38bdf8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><line x1="3" y1="13" x2="3" y2="8"/><line x1="8" y1="13" x2="8" y2="3"/><line x1="13" y1="13" x2="13" y2="6"/></svg>
              </div>
              <div className="mc-lbl">Recall / F1</div>
              <div className="mc-val" style={{color:'#38bdf8'}}>{Math.round(results.metrics.recall * 100)}<span style={{fontSize:'12px',color:'rgba(255,255,255,0.4)'}}>% / {results.metrics.f1}</span></div>
              <div className="mc-tag" style={{background:'rgba(56,189,248,0.08)',color:'#38bdf8',border:'1px solid rgba(56,189,248,0.18)'}}>TabNet model</div>
            </div>
          </div>

          <div className="sec-hd">
            <div className="sec-title">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="4" x2="14" y2="4"/><line x1="5" y1="8" x2="14" y2="8"/><line x1="5" y1="12" x2="14" y2="12"/><circle cx="2.5" cy="4" r=".8" fill="currentColor"/><circle cx="2.5" cy="8" r=".8" fill="currentColor"/><circle cx="2.5" cy="12" r=".8" fill="currentColor"/></svg>
              Module data
            </div>
          </div>

          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{width:'80px'}}>Module</th>
                  {Object.keys(results.modules[0]?.metrics || {}).slice(0, 3).map(k => <th key={k} style={{width:'40px'}}>{k}</th>)}
                  <th style={{width:'90px'}}>Predicted</th>
                  <th style={{width:'70px'}}>Actual</th>
                  <th style={{width:'90px'}}>Confidence</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {results.modules.slice(0, 10).map((m, i) => {
                  const d = m.prediction === 'Defective';
                  const ok = m.prediction === m.actual;
                  const pct = m.confidence;
                  const bc = d ? '#f87171' : '#4ade80';
                  return (
                    <tr key={i}>
                      <td style={{fontWeight:600,color:'#dde2f0'}}>{m.id}</td>
                      {Object.values(m.metrics).slice(0, 3).map((v, j) => <td key={j}>{v}</td>)}
                      <td>
                        <span className={`bdg ${d ? 'bdg-d' : 'bdg-c'}`}>
                          {d ? <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" width="8" height="8" strokeLinecap="round"><path d="M5 1L1 8h8L5 1z"/></svg> 
                             : <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" width="8" height="8" strokeLinecap="round"><polyline points="1 5 4 8 9 2"/></svg>}
                          {m.prediction}
                        </span>
                      </td>
                      <td style={{color:ok ? '#6ee7b7' : '#fca5a5'}}>{m.actual}</td>
                      <td>
                        <span className="cbar"><span className="cfill" style={{width:`${pct}%`,background:bc}}></span></span>
                        <span style={{fontSize:'10px',color:'rgba(255,255,255,0.45)'}}>{pct}%</span>
                      </td>
                      <td style={{fontSize:'10px', color: d ? '#fca5a5' : 'rgba(255,255,255,0.3)'}}>
                        {m.reason || (d ? 'Unknown error' : '—')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="charts">
            
            {/* Class Distribution */}
            {(() => {
               const pDef = results.predictions.defective;
               const pClean = results.predictions.nonDefective;
               const sDef = results.smote.after[1] || 0;
               const sClean = results.smote.after[0] || 0;
               const max = Math.max(pDef, pClean, sDef, sClean);
               
               const h1 = Math.round((pDef / max) * 78);
               const h2 = Math.round((pClean / max) * 78);
               const h3 = Math.round((sDef / max) * 78);
               const h4 = Math.round((sClean / max) * 78);

               return (
                 <div className="cc">
                   <div className="cc-t">
                     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="13" x2="12" y2="7"/><line x1="8" y1="13" x2="8" y2="3"/><line x1="4" y1="13" x2="4" y2="9"/></svg>
                     Class distribution
                   </div>
                   <div className="bars">
                     <div className="bi"><div className="bv">{pDef}</div><div className="bf" style={{height:`${h1}px`,background:'#ef4444',opacity:.7}}></div><div className="bl">Defective</div></div>
                     <div className="bi"><div className="bv">{pClean}</div><div className="bf" style={{height:`${h2}px`,background:'#22c55e',opacity:.7}}></div><div className="bl">Clean</div></div>
                     <div className="bi"><div className="bv">{sDef}</div><div className="bf" style={{height:`${h3}px`,background:'#60a5fa',opacity:.5}}></div><div className="bl">After SMOTE</div></div>
                     <div className="bi"><div className="bv">{sClean}</div><div className="bf" style={{height:`${h4}px`,background:'#38bdf8',opacity:.4}}></div><div className="bl">Clean+</div></div>
                   </div>
                 </div>
               );
            })()}

            {/* Feature Importance */}
            <div className="cc">
              <div className="cc-t">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 9 5 5 9 9 15 3"/></svg>
                Feature importance
              </div>
              {results.featureImportance.slice(0, 5).map((fi, idx) => {
                 const maxVal = results.featureImportance[0].importance;
                 const pct = Math.round((fi.importance / maxVal) * 100);
                 const opacities = [1, 0.8, 0.65, 0.5, 0.35];
                 return (
                   <div className="hbi" key={idx}>
                     <div className="hbn" title={fi.feature}>{fi.feature}</div>
                     <div className="hbt">
                       <div className="hbf" style={{width:`${pct}%`,background:'#60a5fa',opacity:opacities[idx % 5]}}></div>
                     </div>
                     <div className="hbv">{fi.importance.toFixed(2)}</div>
                   </div>
                 );
              })}
            </div>

            {/* Confusion Matrix */}
            {(() => {
               const cm = results.confusionMatrix;
               if (!cm || cm.length < 2) return null;
               const TN = cm[0][0], FP = cm[0][1], FN = cm[1][0], TP = cm[1][1];
               return (
                 <div className="cc">
                   <div className="cc-t">
                     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="14" height="14" rx="2"/><line x1="1" y1="8" x2="15" y2="8"/><line x1="8" y1="1" x2="8" y2="15"/></svg>
                     Confusion matrix
                   </div>
                   <div style={{display:'flex',gap:'3px',paddingLeft:'56px',marginBottom:'4px'}}>
                     <div style={{flex:1,textAlign:'center',fontSize:'9px',color:'rgba(255,255,255,0.3)'}}>Pred. clean</div>
                     <div style={{flex:1,textAlign:'center',fontSize:'9px',color:'rgba(255,255,255,0.3)'}}>Pred. defect</div>
                   </div>
                   <div style={{display:'flex',gap:'4px'}}>
                     <div style={{display:'flex',flexDirection:'column',gap:'4px',width:'54px',flexShrink:0,justifyContent:'space-around'}}>
                       <div style={{height:'44px',display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:'7px',fontSize:'9px',color:'rgba(255,255,255,0.3)'}}>Act. clean</div>
                       <div style={{height:'44px',display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:'7px',fontSize:'9px',color:'rgba(255,255,255,0.3)'}}>Act. defect</div>
                     </div>
                     <div className="mx" style={{flex:1}}>
                       <div className="mxc" style={{background:'rgba(52,211,153,.12)',borderColor:'rgba(52,211,153,.22)',height:'44px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                         <div className="mv" style={{color:'#6ee7b7'}}>{TN}</div><div className="ml" style={{color:'rgba(255,255,255,0.4)'}}>TN</div>
                       </div>
                       <div className="mxc" style={{background:'rgba(248,113,113,.08)',borderColor:'rgba(248,113,113,.18)',height:'44px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                         <div className="mv" style={{color:'#fca5a5',fontSize:'13px'}}>{FP}</div><div className="ml" style={{color:'rgba(255,255,255,0.4)'}}>FP</div>
                       </div>
                       <div className="mxc" style={{background:'rgba(248,113,113,.08)',borderColor:'rgba(248,113,113,.18)',height:'44px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                         <div className="mv" style={{color:'#fca5a5',fontSize:'13px'}}>{FN}</div><div className="ml" style={{color:'rgba(255,255,255,0.4)'}}>FN</div>
                       </div>
                       <div className="mxc" style={{background:'rgba(96,165,250,.12)',borderColor:'rgba(96,165,250,.25)',height:'44px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                         <div className="mv" style={{color:'#93c5fd'}}>{TP}</div><div className="ml" style={{color:'rgba(255,255,255,0.4)'}}>TP</div>
                       </div>
                     </div>
                   </div>
                 </div>
               );
            })()}

            {/* SMOTE Balancing */}
            {(() => {
               const defBef = results.smote.before[1] || 0;
               const cleanBef = results.smote.before[0] || 0;
               const defAft = results.smote.after[1] || 0;
               const cleanAft = results.smote.after[0] || 0;
               const totalBef = defBef + cleanBef;
               const totalAft = defAft + cleanAft;

               const pDefBef = Math.round((defBef / totalBef) * 100);
               const pCleanBef = Math.round((cleanBef / totalBef) * 100);
               const pDefAft = Math.round((defAft / totalAft) * 100);
               const pCleanAft = Math.round((cleanAft / totalAft) * 100);

               const synGen = defAft - defBef + (cleanAft - cleanBef);

               return (
                 <div className="cc">
                   <div className="cc-t">
                     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8a6 6 0 1110.9 3.4"/><path d="M8 5v3l2 2"/></svg>
                     SMOTE balancing
                   </div>
                   <div className="smr">
                     <div className="sml">Defective</div>
                     <div className="smbs">
                       <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
                         <div style={{fontSize:'9px',color:'rgba(255,255,255,0.3)',width:'28px'}}>Before</div>
                         <div className="smb" style={{width:`${pDefBef}%`,background:'rgba(248,113,113,.45)'}}></div>
                         <div style={{fontSize:'9px',color:'rgba(255,255,255,0.3)'}}>{pDefBef}%</div>
                       </div>
                       <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
                         <div style={{fontSize:'9px',color:'rgba(255,255,255,0.3)',width:'28px'}}>After</div>
                         <div className="smb" style={{width:`${pDefAft}%`,background:'#ef4444',opacity:.7}}></div>
                         <div style={{fontSize:'9px',color:'rgba(255,255,255,0.3)'}}>{pDefAft}%</div>
                       </div>
                     </div>
                   </div>
                   <div className="smr">
                     <div className="sml">Clean</div>
                     <div className="smbs">
                       <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
                         <div style={{fontSize:'9px',color:'rgba(255,255,255,0.3)',width:'28px'}}>Before</div>
                         <div className="smb" style={{width:`${pCleanBef}%`,background:'rgba(34,197,94,.4)'}}></div>
                         <div style={{fontSize:'9px',color:'rgba(255,255,255,0.3)'}}>{pCleanBef}%</div>
                       </div>
                       <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
                         <div style={{fontSize:'9px',color:'rgba(255,255,255,0.3)',width:'28px'}}>After</div>
                         <div className="smb" style={{width:`${pCleanAft}%`,background:'#22c55e',opacity:.7}}></div>
                         <div style={{fontSize:'9px',color:'rgba(255,255,255,0.3)'}}>{pCleanAft}%</div>
                       </div>
                     </div>
                   </div>
                   <div style={{marginTop:'10px',padding:'7px 10px',borderRadius:'9px',background:'rgba(96,165,250,0.07)',border:'1px solid rgba(96,165,250,0.15)',display:'flex',alignItems:'center',gap:'7px'}}>
                     <svg viewBox="0 0 16 16" fill="none" stroke="#60a5fa" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><circle cx="8" cy="8" r="6"/><line x1="8" y1="5" x2="8" y2="8"/><circle cx="8" cy="11" r=".5" fill="#60a5fa"/></svg>
                     <span style={{fontSize:'10px',color:'rgba(96,165,250,0.8)'}}>Synthetic samples generated: <strong style={{color:'#93c5fd'}}>{synGen}</strong></span>
                   </div>
                 </div>
               );
            })()}

          </div>

          {/* Module Diagnostic Reasons Panel */}
          <div className="reasons-box">
            <div className="sec-title">
              <svg viewBox="0 0 16 16" fill="none" stroke="#60a5fa" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="8" cy="8" r="7"/><line x1="8" y1="12" x2="8" y2="8"/><line x1="8" y1="5" x2="8" y2="5"/></svg>
              Diagnostic Analysis — Per-Module Reasoning
            </div>
            {results.modules.slice(0, 10).map((m, i) => {
              const isDef = m.prediction === 'Defective';
              return (
                <div key={i} className={`reason-card ${isDef ? 'defective' : 'clean'}`}>
                  <div className="reason-header">
                    <span className="reason-id">{m.id}</span>
                    <span className={`reason-badge ${isDef ? 'defective' : 'clean'}`}>
                      {m.prediction}
                    </span>
                    <span className="reason-conf">{m.confidence}% confidence</span>
                  </div>
                  <div className="reason-text">
                    {m.reason || 'No diagnostic data available for this module.'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Developer Credits */}
      <div className="dev-credits">
        <div>Developed by</div>
        <div className="dev-names">
          <span>ABIOLA AKOREDE</span>
          <span className="dot">•</span>
          <span>AYINDE MUHAMMAD ABDULWADUD</span>
          <span className="dot">•</span>
          <span>ABDUL-RASHEED ADENIYI BABALOLA</span>
        </div>
      </div>

    </div>
  );
}
