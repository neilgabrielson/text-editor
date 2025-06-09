// src/components/SettingsPanel.jsx
import React from 'react';

const SettingsPanel = ({ settings, onSettingsChange, onClose }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    width: '300px',
    backgroundColor: '#f8f8f8',
    borderLeft: '1px solid #ccc',
    padding: '20px',
    boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
    zIndex: 1000
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h3 style={{ margin: 0 }}>Settings</h3>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
        ×
      </button>
    </div>
    
    {/* View Mode */}
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>View Mode</label>
      <select 
        value={settings.viewMode} 
        onChange={(e) => onSettingsChange({...settings, viewMode: e.target.value})}
        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
      >
        <option value="editor">Editor Only</option>
        <option value="preview">Preview Only</option>
        <option value="split">Side-by-Side</option>
      </select>
    </div>

    {/* Font Family */}
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Font Family</label>
      <select 
        value={settings.fontFamily} 
        onChange={(e) => onSettingsChange({...settings, fontFamily: e.target.value})}
        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
      >
        <option value="Georgia, serif">Georgia (Serif)</option>
        <option value="Times, serif">Times (Serif)</option>
        <option value="-apple-system, BlinkMacSystemFont, sans-serif">System (Sans-serif)</option>
        <option value="'Courier New', monospace">Courier (Monospace)</option>
        <option value="'Monaco', monospace">Monaco (Monospace)</option>
      </select>
    </div>

    {/* Font Size */}
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        Font Size: {settings.fontSize}px
      </label>
      <input 
        type="range" 
        min="12" 
        max="24" 
        value={settings.fontSize}
        onChange={(e) => onSettingsChange({...settings, fontSize: parseInt(e.target.value)})}
        style={{ width: '100%' }}
      />
    </div>

    {/* Line Height */}
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        Line Height: {settings.lineHeight}
      </label>
      <input 
        type="range" 
        min="1.2" 
        max="2.0" 
        step="0.1"
        value={settings.lineHeight}
        onChange={(e) => onSettingsChange({...settings, lineHeight: parseFloat(e.target.value)})}
        style={{ width: '100%' }}
      />
    </div>

    {/* Theme */}
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Theme</label>
      <select 
        value={settings.theme} 
        onChange={(e) => onSettingsChange({...settings, theme: e.target.value})}
        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
      >
        <option value="cream">Cream</option>
        <option value="dark">Dark</option>
        <option value="white">White</option>
      </select>
    </div>

    {/* Auto-save */}
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
        <input 
          type="checkbox" 
          checked={settings.autoSave}
          onChange={(e) => onSettingsChange({...settings, autoSave: e.target.checked})}
          style={{ marginRight: '8px' }}
        />
        Auto-save
      </label>
    </div>
  </div>
);

export default SettingsPanel;