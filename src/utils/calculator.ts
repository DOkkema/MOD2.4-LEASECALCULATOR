import { LeaseScenario, LeaseSettings, CalculationResult, AnnualCalculations } from "../types";

export const DEFAULT_SETTINGS: LeaseSettings = {
  euribor: 2.87,
  opslagBank: 3.00,
  opslagLease5Y: 3.50,
  opslagLease10Y: 3.90,
  inflationRate: 2.009, // 2.87 * 0.7
};

export const DEFAULT_SCENARIO_1: LeaseScenario = {
  id: "scenario-1",
  name: "Scenario 1",
  investmentAmount: 100000,
  period: 5,
  installationCosts: 5000,
  maintenanceCosts: 1000,
  residualValue: 25000,
  capitalizeInstallation: true,
  includeMaintenanceInLease: true,
};

export const DEFAULT_SCENARIO_2: LeaseScenario = {
  id: "scenario-2",
  name: "Scenario 2",
  investmentAmount: 180000,
  period: 10,
  installationCosts: 10000,
  maintenanceCosts: 1500,
  residualValue: 40000,
  capitalizeInstallation: true,
  includeMaintenanceInLease: true,
};

/**
 * Calculates lease details for a scenario and set of interest settings
 */
export function calculateLease(
  scenario: LeaseScenario,
  settings: LeaseSettings
): CalculationResult {
  const {
    investmentAmount,
    period,
    installationCosts,
    maintenanceCosts,
    residualValue,
    capitalizeInstallation,
    includeMaintenanceInLease,
  } = scenario;

  // Determine annual interest rate
  const opslag = period === 5 ? settings.opslagLease5Y : settings.opslagLease10Y;
  const annualInterestRate = (settings.euribor + opslag) / 100; // as decimal, e.g. 0.0637 for 6.37%
  const monthlyInterestRate = annualInterestRate / 12;

  // Financed amount (usually Investment, or Investment + Installation if capitalized)
  const financedAmount = investmentAmount + (capitalizeInstallation ? installationCosts : 0);
  const totalMonths = period * 12;

  // Calculate monthly payment using standard formula:
  // M = [ PV * j - RV * j * (1 + j)^(-n) ] / [ 1 - (1 + j)^(-n) ]
  let monthlyLeaseExclMaintenance = 0;
  if (monthlyInterestRate === 0) {
    monthlyLeaseExclMaintenance = (financedAmount - residualValue) / totalMonths;
  } else {
    const discountFactor = Math.pow(1 + monthlyInterestRate, -totalMonths);
    monthlyLeaseExclMaintenance =
      (financedAmount * monthlyInterestRate - residualValue * monthlyInterestRate * discountFactor) /
      (1 - discountFactor);
  }

  // Monthly maintenance in Year 1
  const monthlyMaintenanceYear1 = maintenanceCosts / 12;
  const totalMonthlyPaymentYear1 =
    monthlyLeaseExclMaintenance + (includeMaintenanceInLease ? monthlyMaintenanceYear1 : 0);

  // Perform a month-by-month simulation to get exact yearly values
  const annualBreakdown: AnnualCalculations[] = [];
  let remainingPrincipal = financedAmount;

  // Initial machine value (initial book value)
  const initialMachineValue = investmentAmount + installationCosts;
  // Linear depreciation setup: from Initial value down to Residual Value over 'period' years
  const annualDepreciation = (initialMachineValue - residualValue) / period;

  const inflationDec = settings.inflationRate / 100;

  for (let year = 1; year <= period; year++) {
    let yearInterestPaid = 0;
    let yearPrincipalPaid = 0;
    let yearLeasePaymentExclMaintenance = 0;

    // Simulate 12 months for this year
    for (let month = 1; month <= 12; month++) {
      const interestForMonth = remainingPrincipal * monthlyInterestRate;
      const principalForMonth = monthlyLeaseExclMaintenance - interestForMonth;

      yearInterestPaid += interestForMonth;
      yearPrincipalPaid += principalForMonth;
      yearLeasePaymentExclMaintenance += monthlyLeaseExclMaintenance;

      remainingPrincipal -= principalForMonth;
    }

    // Adjust residual issues
    if (year === period) {
      // Small precision adjustments
      const diff = remainingPrincipal - residualValue;
      yearPrincipalPaid += diff;
      remainingPrincipal = residualValue;
    }

    // Maintenance cost for this Year (indexed by inflation)
    // Year 1 is uninflated, Year 2 is inflated once, etc.
    const maintenanceCostForYear = maintenanceCosts * Math.pow(1 + inflationDec, year - 1);
    
    // Starting value of the machine for this year
    const startValue = initialMachineValue - (year - 1) * annualDepreciation;
    const endValue = initialMachineValue - year * annualDepreciation;

    const totalLeasePayment =
      yearLeasePaymentExclMaintenance + (includeMaintenanceInLease ? maintenanceCostForYear : 0);

    annualBreakdown.push({
      year,
      startValue,
      endValue,
      depreciation: annualDepreciation,
      leasePaymentExclMaintenance: yearLeasePaymentExclMaintenance,
      maintenanceCost: maintenanceCostForYear,
      totalLeasePayment,
      interestPaid: yearInterestPaid,
      principalPaid: yearPrincipalPaid,
    });
  }

  // Aggregate totals
  const totalCostExclMaintenance = monthlyLeaseExclMaintenance * totalMonths;
  const totalMaintenance = annualBreakdown.reduce((sum, yr) => sum + yr.maintenanceCost, 0);
  const totalCostInclMaintenance =
    totalCostExclMaintenance + (includeMaintenanceInLease ? totalMaintenance : 0);

  return {
    financedAmount,
    interestRate: annualInterestRate,
    monthlyLeaseExclMaintenance,
    monthlyMaintenanceYear1,
    totalMonthlyPaymentYear1,
    totalCostExclMaintenance,
    totalCostInclMaintenance,
    annualBreakdown,
  };
}
