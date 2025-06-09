// src/components/MarkdownPreview.jsx
import React, { useState, useEffect } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';

const MarkdownPreview = ({ content, theme, fontSize, fontFamily, lineHeight }) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const processMarkdown = async () => {
      try {
        const result = await unified()
          .use(remarkParse)
          .use(remarkHtml)
          .process(content);
        setHtml(result.toString());
      } catch (error) {
        console.error('Error processing markdown:', error);
        setHtml('<p>Error rendering markdown</p>');
      }
    };

    if (content) {
      processMarkdown();
    } else {
      setHtml('');
    }
  }, [content]);

  return (
    <div 
      style={{
        flex: 1,
        padding: '40px',
        fontSize: `${fontSize}px`,
        fontFamily: fontFamily,
        lineHeight: lineHeight,
        backgroundColor: theme.background,
        color: theme.text,
        overflow: 'auto'
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MarkdownPreview;