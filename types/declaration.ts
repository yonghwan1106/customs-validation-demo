export interface Declaration {
  id: string;
  userId: string;
  status: 'draft' | 'validated' | 'submitted';
  basicInfo: {
    importerName: string;
    importerCode: string;
    declarationDate: Date;
  };
  items: DeclarationItem[];
  validationResults: ValidationResult[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DeclarationItem {
  id: string;
  itemName: string;
  hsCode: string;
  origin: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
}

export interface ValidationResult {
  id: string;
  type: 'hscode' | 'origin' | 'price' | 'quantity';
  status: 'pass' | 'warning' | 'error';
  message: string;
  suggestion?: string;
  severity: 'low' | 'medium' | 'high';
  confidence?: number;
}

export interface HSCodePrediction {
  hsCode: string;
  description: string;
  confidence: number;
  tariffRate: string;
}

export interface PriceValidation {
  isValid: boolean;
  currentPrice: number;
  averagePrice: number;
  deviation: number;
  zScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface FTABenefit {
  country: string;
  baseRate: string;
  ftaRate: string;
  savingsAmount: number;
  savingsPercentage: number;
  requiresCertificate: boolean;
  certificateType?: string;
}