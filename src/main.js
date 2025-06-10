// src/main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// File operations
ipcMain.handle('open-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
});

ipcMain.handle('read-directory', async (event, dirPath) => {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    return items.map(item => ({
      name: item.name,
      path: path.join(dirPath, item.name),
      isDirectory: item.isDirectory()
    }));
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.error('Error reading file:', error);
    return '';
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing file:', error);
    return false;
  }
});

// Settings file path - let's debug this
const settingsPath = path.join(os.homedir(), '.text-editor-settings.json');

ipcMain.handle('load-settings', async () => {
  console.log('MAIN: Loading settings from:', settingsPath);
  console.log('MAIN: Home directory is:', os.homedir());
  
  try {
    // Check if file exists first
    const fileExists = await fs.access(settingsPath).then(() => true).catch(() => false);
    console.log('MAIN: Settings file exists:', fileExists);
    
    if (!fileExists) {
      console.log('MAIN: No settings file found, returning defaults');
      return {
        fontFamily: 'Georgia, serif',
        fontSize: 16,
        lineHeight: 1.6,
        theme: 'cream',
        autoSave: true,
        viewMode: 'editor'
      };
    }
    
    const settingsData = await fs.readFile(settingsPath, 'utf8');
    console.log('MAIN: Settings file content:', settingsData);
    return JSON.parse(settingsData);
  } catch (error) {
    console.error('MAIN: Error loading settings:', error);
    // Return default settings if file doesn't exist
    return {
      fontFamily: 'Georgia, serif',
      fontSize: 16,
      lineHeight: 1.6,
      theme: 'cream',
      autoSave: true,
      viewMode: 'editor'
    };
  }
});

ipcMain.handle('save-settings', async (event, settings) => {
  console.log('MAIN: Attempting to save settings to:', settingsPath);
  console.log('MAIN: Settings to save:', settings);
  console.log('MAIN: Home directory is:', os.homedir());
  
  try {
    // Check if home directory exists and is writable
    const homeStats = await fs.stat(os.homedir());
    console.log('MAIN: Home directory stats:', {
      isDirectory: homeStats.isDirectory(),
      mode: homeStats.mode.toString(8)
    });
    
    const settingsJson = JSON.stringify(settings, null, 2);
    console.log('MAIN: JSON to write:', settingsJson);
    
    await fs.writeFile(settingsPath, settingsJson, 'utf8');
    console.log('MAIN: Settings saved successfully!');
    
    // Verify the file was actually written
    const fileExists = await fs.access(settingsPath).then(() => true).catch(() => false);
    console.log('MAIN: File exists after write:', fileExists);
    
    if (fileExists) {
      const writtenContent = await fs.readFile(settingsPath, 'utf8');
      console.log('MAIN: File content after write:', writtenContent);
    }
    
    return true;
  } catch (error) {
    console.error('MAIN: Error saving settings:', error);
    console.error('MAIN: Error details:', {
      code: error.code,
      errno: error.errno,
      path: error.path,
      syscall: error.syscall
    });
    return false;
  }
});

// Debug helper - get current working directory and paths
ipcMain.handle('debug-paths', async () => {
  return {
    cwd: process.cwd(),
    homedir: os.homedir(),
    settingsPath: settingsPath,
    platform: process.platform
  };
});