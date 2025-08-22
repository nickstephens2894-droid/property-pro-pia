import { useState, useCallback, useRef } from 'react';

/**
 * Hook to protect input fields from automatic updates while user is actively editing
 */
export const useInputProtection = () => {
  const [protectedFields, setProtectedFields] = useState(new Set<string>());
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const protectField = useCallback((fieldId: string, duration = 2000) => {
    console.log('🛡️ Protecting field:', fieldId, 'for', duration, 'ms');
    setProtectedFields(prev => new Set(prev).add(fieldId));
    
    // Clear existing timeout for this field
    const existingTimeout = timeoutRefs.current.get(fieldId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      console.log('🔓 Unprotecting field:', fieldId);
      setProtectedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldId);
        return newSet;
      });
      timeoutRefs.current.delete(fieldId);
    }, duration);
    
    timeoutRefs.current.set(fieldId, timeout);
  }, []);

  const isFieldProtected = useCallback((fieldId: string) => {
    return protectedFields.has(fieldId);
  }, [protectedFields]);

  const clearProtection = useCallback((fieldId: string) => {
    const timeout = timeoutRefs.current.get(fieldId);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(fieldId);
    }
    setProtectedFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(fieldId);
      return newSet;
    });
  }, []);

  return {
    protectField,
    isFieldProtected,
    clearProtection
  };
};