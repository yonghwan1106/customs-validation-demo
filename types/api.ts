import { ValidationResult, HSCodePrediction, PriceValidation, FTABenefit } from './declaration';

// API Request Types
export interface HSCodeValidationRequest {
  itemName: string;
  description?: string;
}

export interface PriceValidationRequest {
  hsCode: string;
  unitPrice: number;
  quantity: number;
}

export interface OriginValidationRequest {
  hsCode: string;
  origin: string;
}

export interface FTACalculationRequest {
  hsCode: string;
  origin: string;
  totalValue: number;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface HSCodeValidationResponse {
  predictions: HSCodePrediction[];
  validationResult: ValidationResult;
}

export interface PriceValidationResponse {
  validation: PriceValidation;
  validationResult: ValidationResult;
}

export interface OriginValidationResponse {
  isValid: boolean;
  validationResult: ValidationResult;
}

export interface FTACalculationResponse {
  benefits: FTABenefit[];
  recommendedOrigin?: string;
}

// Demo Scenario Types
export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  expectedOutcome: 'success' | 'warning' | 'error';
  inputData: {
    itemName: string;
    hsCode?: string;
    origin?: string;
    quantity: number;
    unitPrice: number;
    unit: string;
  };
}