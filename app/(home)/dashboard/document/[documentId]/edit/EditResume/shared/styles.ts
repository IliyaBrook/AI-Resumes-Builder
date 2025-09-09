import React from 'react';

export const pageStyles: React.CSSProperties = {
  width: '210mm',
  height: '297mm',
  padding: '0',
  boxSizing: 'border-box',
};

interface PagePreviewStyles {
  className: string;
  style?: React.CSSProperties;
}

export const getPagePrintStyles = (themeColor: string): PagePreviewStyles => ({
  className: 'w-full bg-white !font-open-sans px-10',
  style: {
    minHeight: '297mm',
    boxSizing: 'border-box',
    borderTop: `13px solid ${themeColor}`,
  },
});

export const pagePreviewStyles: {
  className: string;
  style?: React.CSSProperties;
} = {
  className: 'relative overflow-hidden border border-gray-300 bg-white shadow-2xl px-10',
  style: pageStyles,
};
