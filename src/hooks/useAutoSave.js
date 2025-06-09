// src/hooks/useAutoSave.js
import { useEffect, useRef } from 'react';

export const useAutoSave = (content, originalContent, currentFile, autoSave, saveFunction) => {
  const autoSaveTimer = useRef(null);
  const hasUnsavedChanges = content !== originalContent;

  useEffect(() => {
    if (autoSave && hasUnsavedChanges && currentFile) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      
      autoSaveTimer.current = setTimeout(() => {
        saveFunction();
      }, 2000);
    }
    
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [content, autoSave, hasUnsavedChanges, currentFile, saveFunction]);

  return hasUnsavedChanges;
};