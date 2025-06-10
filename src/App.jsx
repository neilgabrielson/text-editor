// src/App.jsx
import React, { useState, useEffect } from 'react';
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
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  
  // Store content for all opened files
  const [fileContents, setFileContents] = useState({}); // current content
  const [originalContents, setOriginalContents] = useState({}); // original content from disk
  
  const [settings, setSettings] = useState({
    fontFamily: 'Georgia, serif',
    fontSize: 16,
    lineHeight: 1.6,
    theme: 'cream',
    autoSave: true,
    viewMode: 'editor'
  });

  const [settingsLoaded, setSettingsLoaded] = useState(false); // Track if settings have been loaded

  // load settings on startup
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await window.electronAPI.loadSettings();
        if (savedSettings) {
          setSettings(savedSettings);
        }
        setSettingsLoaded(true);
      } catch (error) {
        console.error('Error loading settings:', error);
        setSettingsLoaded(true);
      }
    };
    
    loadSettings();
  }, []);

  // save settings when they change (but only after initial load)
  useEffect(() => {
    if (!settingsLoaded) return; // Don't save until we've loaded initial settings
    
    const saveSettings = async () => {
      try {
        await window.electronAPI.saveSettings(settings);
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };
    
    saveSettings();
  }, [settings, settingsLoaded]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      
      if (cmdOrCtrl) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            if (e.shiftKey) {
              // Cmd+Shift+S - Save all files
              saveAllFiles();
            } else {
              // Cmd+S - Save current file
              if (currentFile && hasUnsavedChanges) {
                saveFile();
              }
            }
            break;
          case ',':
            e.preventDefault();
            // Cmd+, - Toggle settings
            setSettingsVisible(prev => !prev);
            break;
          case 'b':
            e.preventDefault();
            // Cmd+B - Toggle sidebar
            if (currentFolder) {
              setSidebarVisible(prev => !prev);
            }
            break;
          case 'w':
            e.preventDefault();
            // Cmd+W - Close folder
            if (currentFolder) {
              closeFolder();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentFile, hasUnsavedChanges, currentFolder, saveFile, saveAllFiles, closeFolder]);

  const currentTheme = themes[settings.theme] || themes.cream; // Fallback to cream theme

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

  const closeFolder = () => {
    setCurrentFolder(null);
    setFiles([]);
    setCurrentFile(null);
    setFileContents({});
    setOriginalContents({});
    setSidebarVisible(true);
  };

  const openFile = async (filePath) => {
    if (!filePath.endsWith('.md') && !filePath.endsWith('.txt')) {
      return;
    }
    
    try {
      // If we already have content for this file, use it
      if (fileContents[filePath] !== undefined) {
        setCurrentFile(filePath);
        return;
      }
      
      // Otherwise, load from disk
      const fileContent = await window.electronAPI.readFile(filePath);
      setCurrentFile(filePath);
      setFileContents(prev => ({
        ...prev,
        [filePath]: fileContent
      }));
      setOriginalContents(prev => ({
        ...prev,
        [filePath]: fileContent
      }));
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const saveFile = async (filePath = currentFile) => {
    if (!filePath || !fileContents[filePath]) return;
    
    try {
      await window.electronAPI.writeFile(filePath, fileContents[filePath]);
      setOriginalContents(prev => ({
        ...prev,
        [filePath]: fileContents[filePath]
      }));
      console.log('File saved!');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const updateFileContent = (content) => {
    if (!currentFile) return;
    setFileContents(prev => ({
      ...prev,
      [currentFile]: content
    }));
  };

  // Get current file content
  const currentContent = currentFile ? (fileContents[currentFile] || '') : '';
  const currentOriginalContent = currentFile ? (originalContents[currentFile] || '') : '';

  const hasUnsavedChanges = useAutoSave(
    currentContent, 
    currentOriginalContent, 
    currentFile, 
    settings.autoSave, 
    saveFile
  );

  // Check if any file has unsaved changes
  const fileHasUnsavedChanges = (filePath) => {
    const current = fileContents[filePath];
    const original = originalContents[filePath];
    return current !== undefined && original !== undefined && current !== original;
  };

  // Save all files with unsaved changes
  const saveAllFiles = async () => {
    const filesToSave = Object.keys(fileContents).filter(filePath => 
      fileHasUnsavedChanges(filePath)
    );
    
    for (const filePath of filesToSave) {
      await saveFile(filePath);
    }
  };

  const renderEditor = () => {
    if (settings.viewMode === 'preview') {
      return (
        <MarkdownPreview
          content={currentContent}
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
            value={currentContent}
            onChange={(e) => updateFileContent(e.target.value)}
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
            content={currentContent}
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
        value={currentContent}
        onChange={(e) => updateFileContent(e.target.value)}
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
    return <WelcomeScreen onOpenFolder={openFolder} theme={currentTheme} />;
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
          fileHasUnsavedChanges={fileHasUnsavedChanges}
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
              title="Show sidebar (⌘B)"
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
                onClick={() => saveFile()}
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
                title={`${hasUnsavedChanges ? '● Unsaved' : '✓ Saved'} (⌘S)`}
              >
                {hasUnsavedChanges ? '● Unsaved' : '✓ Saved'}
              </button>

              {/* Save All button if multiple files have changes */}
              {Object.keys(fileContents).filter(filePath => fileHasUnsavedChanges(filePath)).length > 1 && (
                <button 
                  onClick={saveAllFiles}
                  style={{ 
                    marginLeft: '10px',
                    backgroundColor: '#ffa500',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                  title="Save all modified files (⌘⇧S)"
                >
                  Save All
                </button>
              )}
              
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
                title="Settings (⌘,)"
              >
                ⚙️
              </button>

              {/* Close Folder button moved to far right */}
              <button 
                onClick={closeFolder}
                style={{ 
                  marginLeft: '15px',
                  background: 'none',
                  border: `1px solid ${currentTheme.border}`,
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: currentTheme.text,
                  opacity: 0.7,
                  padding: '4px 8px',
                  borderRadius: '3px'
                }}
                title="Close folder and return to welcome screen (⌘W)"
              >
                Close Folder
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
                title="Settings (⌘,)"
              >
                ⚙️
              </button>
              
              <button 
                onClick={closeFolder}
                style={{ 
                  marginLeft: '15px',
                  background: 'none',
                  border: `1px solid ${currentTheme.border}`,
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: currentTheme.text,
                  opacity: 0.7,
                  padding: '4px 8px',
                  borderRadius: '3px'
                }}
                title="Close folder and return to welcome screen (⌘W)"
              >
                Close Folder
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
          theme={currentTheme}
        />
      )}
    </div>
  );
};

export default App;