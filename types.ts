
export interface Market {
  country: string;
  score: number;
  justification: string;
  deepDive: MarketDeepDive;
}

export interface MarketDeepDive {
  targetCompanies: string[];
  distributionPartners: string[];
  outreachEmail: string;
}

export interface ScalingReport {
  markets: Market[];
}

export interface Recommendation {
  type: string;
  explanation: string;
  examples: string[];
}

export interface OptimizationCategory {
  title: string;
  recommendations: Recommendation[];
}

export interface OptimizationReport {
  categories: OptimizationCategory[];
}

export interface Reports {
  scaling: ScalingReport;
  optimization: OptimizationReport;
}
