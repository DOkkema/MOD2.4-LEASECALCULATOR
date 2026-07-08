import React, { useState } from "react";
import { LeaseScenario, CalculationResult } from "../types";
import { ToggleLeft, ToggleRight, Bookmark } from "lucide-react";

interface YearlyComparisonTableProps {
  scenario: LeaseScenario;
  result: CalculationResult;
}

export const YearlyComparisonTable: React.FC<YearlyComparisonTableProps> = ({
  scenario,
  result,
}) => {
  const [showFullDetails, setShowFullDetails] = useState<boolean>(true);

  const yearsArray = Array.from({ length: scenario.period }, (_, i) => i + 1);

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div id="yearly-comparison" className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden animate-fade-in">
      {/* Header section with toggle option */}
      <div className="bg-slate-50/55 border-b border-slate-250 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-sans font-extrabold text-slate-800 text-[15px] tracking-tight uppercase tracking-wider">
            Jaarlijks Amortisatie- & Kostenverloop
          </h3>
          <p className="text-[11px] text-slate-450 mt-0.5">
            Volledig overzicht van de machine-boekwaarde, afschrijving, rentebetaling, aflossing en onderhoudskosten.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Boekhoudkundige details</span>
          <button
            type="button"
            id="toggle-detailed-view"
            onClick={() => setShowFullDetails(!showFullDetails)}
            className="text-slate-500 hover:text-slate-700 transition-colors focus:outline-none shrink-0 cursor-pointer"
            title="Schakel tussen compacte en gedetailleerde boekhoudkundige details"
          >
            {showFullDetails ? (
              <ToggleRight className="w-8 h-8 text-cerulean fill-celadon/30" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-300" />
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-750 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <th className="p-3.5 text-center w-14 border-r border-slate-200">Jaar</th>
              <th className="p-3.5 text-right text-yale-blue font-extrabold">Machine Boekwaarde (eind)</th>
              <th className="p-3.5 text-right text-cerulean font-extrabold">Lease (excl. onderhoud)</th>
              {showFullDetails && (
                <>
                  <th className="p-3 text-right text-slate-500">Rentedeel</th>
                  <th className="p-3 text-right text-slate-500">Aflossing</th>
                  <th className="p-3 text-right text-slate-550">Onderhoud / jr</th>
                </>
              )}
              <th className="p-3.5 text-right font-extrabold text-yale-blue bg-celadon/10">Totaal per jaar</th>
            </tr>
          </thead>

          <tbody>
            {yearsArray.map((year) => {
              const row = result.annualBreakdown.find((y) => y.year === year);
              if (!row) return null;

              return (
                <tr
                  key={year}
                  id={`yearly-row-${year}`}
                  className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors font-medium text-slate-700"
                >
                  {/* Year column */}
                  <td className="p-3.5 font-bold text-center bg-slate-50/60 font-mono text-slate-600 border-r border-slate-200">
                    {year}
                  </td>
                  
                  {/* End value */}
                  <td className="p-3 text-right font-mono text-slate-600">
                    {formatEuro(row.endValue)}
                  </td>

                  {/* Lease payment excl maintenance */}
                  <td className="p-3 text-right font-mono font-bold text-cerulean">
                    {formatEuro(row.leasePaymentExclMaintenance)}
                  </td>

                  {showFullDetails && (
                    <>
                      {/* Interest paid */}
                      <td className="p-3 text-right font-mono text-slate-500">
                        {formatEuro(row.interestPaid)}
                      </td>
                      {/* Principal paid */}
                      <td className="p-3 text-right font-mono text-slate-500">
                        {formatEuro(row.principalPaid)}
                      </td>
                      {/* Maintenance cost */}
                      <td className="p-3 text-right font-mono text-slate-500">
                        {formatEuro(row.maintenanceCost)}
                      </td>
                    </>
                  )}

                  {/* Total lease payment */}
                  <td className="p-3.5 text-right font-mono font-extrabold text-yale-blue bg-celadon/10">
                    {formatEuro(row.totalLeasePayment)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer bar */}
      <div className="bg-slate-50 p-6 border-t border-slate-200">
        <div className="flex items-start gap-3">
          <Bookmark className="w-5 h-5 text-cerulean shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
            <p>
              De totale leasekosten voor <strong className="text-slate-800 font-bold">{scenario.name}</strong> over de gehele looptijd bedragen <strong className="text-yale-blue font-bold">{formatEuro(result.totalCostInclMaintenance)}</strong> {scenario.includeMaintenanceInLease ? "(inclusief onderhoud)" : "(exclusief onderhoud)"}.
            </p>
            <p className="text-slate-450">
              Gedurende deze {scenario.period} jaar daalt de waarde van de machine boekhoudkundig via lineaire afschrijving van <strong className="text-slate-705">{formatEuro(scenario.investmentAmount + (scenario.capitalizeInstallation ? scenario.installationCosts : 0))}</strong> (investering + geactiveerde installatiekosten) naar <strong className="text-slate-705">{formatEuro(scenario.residualValue)}</strong> restwaarde.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
