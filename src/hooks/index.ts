// Export all hooks from this central location
export { useProperties } from './useProperties';
export { useScenarios } from './useScenarios';
export { useLoanFunds } from './useLoanFunds';
export { useFieldConfirmations } from './useFieldConfirmations';
export { useIsMobile } from './use-mobile';
export { useInputProtection } from './useInputProtection';

// Export types from repository instead
export type { Investor, Property, Scenario } from '@/services/repository';