export interface LeaseSettings {
  euribor: number; // e.g. 2.87 (%)
  opslagBank: number; // e.g. 3.00 (%)
  opslagLease5Y: number; // e.g. 3.50 (%)
  opslagLease10Y: number; // e.g. 3.90 (%)
  inflationRate: number; // e.g. euribor * 0.7 = 2.009 (%)
}

export type LeasePeriod = 5 | 10;

export interface LeaseScenario {
  id: string;
  name: string;
  investmentAmount: number; // Investeringsbedrag
  period: LeasePeriod; // Lease periode (5 of 10 jaar)
  installationCosts: number; // Installatiekosten
  maintenanceCosts: number; // Jaarlijkse onderhoudskosten
  residualValue: number; // Restwaarde na leaseperiode
  capitalizeInstallation: boolean; // Of de installatiekosten worden meegefinancierd
  includeMaintenanceInLease: boolean; // Of onderhoud in het leasebedrag zit (Operational lease)
}

export interface AnnualCalculations {
  year: number;
  startValue: number;
  endValue: number;
  depreciation: number;
  leasePaymentExclMaintenance: number;
  maintenanceCost: number;
  totalLeasePayment: number;
  interestPaid: number;
  principalPaid: number;
}

export interface CalculationResult {
  financedAmount: number;
  interestRate: number;
  monthlyLeaseExclMaintenance: number;
  monthlyMaintenanceYear1: number;
  totalMonthlyPaymentYear1: number;
  totalCostExclMaintenance: number;
  totalCostInclMaintenance: number;
  annualBreakdown: AnnualCalculations[];
}

