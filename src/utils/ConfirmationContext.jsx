import React, { createContext, useState, useContext } from 'react';
import ConfirmationDialog from '../components/Playbook/ConfirmationDialog/ConfirmationDialog';

// Create the context
const ConfirmationContext = createContext();

// Create a provider component
export const ConfirmationProvider = ({ children }) => {
  const [state, setState] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    yesMsg: 'אישור',
    noMsg: 'ביטול'
  });

  // Function to open the dialog with custom parameters
  const confirmAction = (message, onConfirm, options = {}) => {
    setState({
      isOpen: true,
      message,
      onConfirm: () => {
        onConfirm();
        closeDialog();
      },
      yesMsg: options.yesMsg || 'אישור',
      noMsg: options.noMsg || 'ביטול'
    });
  };

  // Function to close the dialog
  const closeDialog = () => {
    setState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  return (
    <ConfirmationContext.Provider value={{ confirmAction }}>
      {children}
      {state.isOpen && (
        <ConfirmationDialog
          message={state.message}
          onConfirm={state.onConfirm}
          onCancel={closeDialog}
          yesMsg={state.yesMsg}
          noMsg={state.noMsg}
        />
      )}
    </ConfirmationContext.Provider>
  );
};

// Custom hook to use the confirmation dialog
export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  return context;
};