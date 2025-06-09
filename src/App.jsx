// src/App.jsx
import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import FileTree from './components/FileTree';
import SettingsPanel from './components/SettingsPanel';
import MarkdownPreview from './components/MarkdownPreview';
import { useAutoSave } from './hooks/useAutoSave';
import { themes } from './utils/themes';

const App = () => {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  
  const [settings, setSettings] = useState({
    fontFamily: 'Georgia, serif',
    fontSize: 16,
    lineHeight: 1.6,
    theme: 'cream',
    autoSave: true,
    viewMode: 'editor'
  });

  const currentTheme = themes[settings.theme];

  const openFolder = async (folderPath = null, fileList = null) => {
    try {
      if (folderPath && fileList) {
        setCurrentFolder(folderPath);
        setFiles(fileList);
        return;
      }
      
      const selectedPath = await window.electronAPI.openFolder();
      if (selectedPath) {
        setCurrentFolder(selectedPath);
        const fileList = await window.electronAPI.readDirectory(selectedPath);
        setFiles(fileList);
      }
    } catch (error) {
      console.error('Error opening folder:', error);
    }
  };

  const openFile = async (filePath) => {
    if (!filePath.endsWith('.md') && !filePath.endsWith('.txt')) {
      return;
    }
    
    try {
      const fileContent = await window.electronAPI.readFile(filePath);
      setCurrentFile(filePath);
      setContent(fileContent);
      setOriginalContent(fileContent);
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const saveFile = async () => {
    if (currentFile && hasUnsavedChanges) {
      try {
        await window.electronAPI.writeFile(currentFile, content);
        setOriginalContent(content);
        console.log('File saved!');
      } catch (error) {
        console.error('Error saving file:', error);
      }
    }
  };

  const hasUnsavedChanges = useAutoSave(
    content, 
    originalContent, 
    currentFile, 
    settings.autoSave, 
    saveFile
  );

  const renderEditor = () => {
    if (settings.viewMode === 'preview') {
      return (
        <MarkdownPreview
          content={content}
          theme={currentTheme}
          fontSize={settings.fontSize}
          fontFamily={settings.fontFamily}
          lineHeight={settings.lineHeight}
        />
      );
    }

    if (settings.viewMode === 'split') {
      return (
        <div style={{ display: 'flex', flex: 1 }}>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing markdown..."
            style={{ 
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '40px',
              fontSize: `${settings.fontSize}px`,
              fontFamily: "'Monaco', monospace",
              lineHeight: settings.lineHeight,
              resize: 'none',
              backgroundColor: currentTheme.background,
              color: currentTheme.text,
              borderRight: `1px solid ${currentTheme.border}`
            }}
          />
          <MarkdownPreview
            content={content}
            theme={currentTheme}
            fontSize={settings.fontSize}
            fontFamily={settings.fontFamily}
            lineHeight={settings.lineHeight}
          />
        </div>
      );
    }

    return (
      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing markdown..."
        style={{ 
          flex: 1,
          border: 'none',
          outline: 'none',
          padding: '40px',
          fontSize: `${settings.fontSize}px`,
          fontFamily: settings.fontFamily,
          lineHeight: settings.lineHeight,
          resize: 'none',
          backgroundColor: currentTheme.background,
          color: currentTheme.text
        }}
      />
    );
  };

  if (!currentFolder) {
    return <WelcomeScreen onOpenFolder={openFolder} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: currentTheme.background }}>
      {sidebarVisible && (
        <FileTree
          files={files}
          currentFile={currentFile}
          onFileSelect={openFile}
          onToggleSidebar={() => setSidebarVisible(false)}
          theme={currentTheme}
        />
      )}
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header Bar */}
        <div style={{ 
          padding: '10px', 
          borderBottom: `1px solid ${currentTheme.border}`,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: currentTheme.sidebar,
          color: currentTheme.text
        }}>
          {!sidebarVisible && (
            <button 
              onClick={() => setSidebarVisible(true)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                fontSize: '16px',
                marginRight: '10px',
                color: currentTheme.text
              }}
            >
              →
            </button>
          )}
          
          {currentFile ? (
            <>
              <span style={{ flex: 1 }}>
                {currentFile}
                {currentFile.endsWith('.md') && (
                  <span style={{ marginLeft: '10px', fontSize: '12px', opacity: 0.7 }}>
                    {settings.viewMode === 'editor' ? 'Editor' : 
                     settings.viewMode === 'preview' ? 'Preview' : 'Split View'}
                  </span>
                )}
              </span>
              
              <button 
                onClick={saveFile}
                disabled={!hasUnsavedChanges}
                style={{ 
                  marginLeft: '10px',
                  backgroundColor: hasUnsavedChanges ? '#ff6b6b' : '#51cf66',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: hasUnsavedChanges ? 'pointer' : 'default',
                  opacity: hasUnsavedChanges ? 1 : 0.7
                }}
              >
                {hasUnsavedChanges ? '● Unsaved' : '✓ Saved'}
              </button>
              
              <button 
                onClick={() => setSettingsVisible(true)}
                style={{ 
                  marginLeft: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: currentTheme.text
                }}
              >
                ⚙️
              </button>
            </>
          ) : (
            <>
              <span style={{ flex: 1, color: '#999' }}>Select a file to start editing</span>
              <button 
                onClick={() => setSettingsVisible(true)}
                style={{ 
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: currentTheme.text
                }}
              >
                ⚙️
              </button>
            </>
          )}
        </div>
        
        {currentFile ? renderEditor() : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#999',
            fontSize: '16px'
          }}>
            <p>Select a file from the sidebar to start editing</p>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>
              Supports .md (Markdown) and .txt files
            </p>
          </div>
        )}
      </div>

      {settingsVisible && (
        <SettingsPanel 
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setSettingsVisible(false)}
        />
      )}
    </div>
  );
};

export default App;