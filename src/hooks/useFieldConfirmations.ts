import { useState, useCallback } from 'react';

interface ConfirmationState {
  hasShownConstructionWarning: boolean;
  hasShownBuildingWarning: boolean;
}

const STORAGE_KEY = 'property-form-confirmations';

export const useFieldConfirmations = () => {
  const [confirmations, setConfirmations] = useState<ConfirmationState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      hasShownConstructionWarning: false,
      hasShownBuildingWarning: false,
    };
  });

  const updateConfirmation = useCallback((key: keyof ConfirmationState, value: boolean) => {
    const newConfirmations = { ...confirmations, [key]: value };
    setConfirmations(newConfirmations);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfirmations));
  }, [confirmations]);

  return {
    confirmations,
    updateConfirmation,
  };
};