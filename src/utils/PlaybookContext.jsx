import React, { createContext, useContext } from 'react';

const PlaybookContext = createContext(null);

export const PlaybookProvider = ({ children, value }) => {
  return (
    <PlaybookContext.Provider value={value}>
      {children}
    </PlaybookContext.Provider>
  );
};

export const usePlaybook = () => {
  const context = useContext(PlaybookContext);
  if (context === null) {
    throw new Error('usePlaybook must be used within a PlaybookProvider');
  }
  return context;
};