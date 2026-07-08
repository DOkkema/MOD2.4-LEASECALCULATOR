import React from "react";
import { LeaseScenario, LeasePeriod } from "../types";
import { HelpCircle, Sparkles, SlidersHorizontal, ToggleLeft, ToggleRight } from "lucide-react";

interface ScenarioFormProps {
  scenario: LeaseScenario;
  onChange: (updated: LeaseScenario) => void;
  accentColor: "indigo" | "amber";
  title: string;
}

export const ScenarioForm: React.FC<ScenarioFormProps> = ({
  scenario,
  onChange,
  accentColor,
  title,
}) => {
  const isIndigo = accentColor === "indigo";
  
  const handleNumChange = (field: keyof LeaseScenario, value: string) => {
    const rawValue = value.replace(/\D/g, ""); // strip all non-digits to handle Dutch dot thousand-separators robustly
    const num = parseInt(rawValue, 10);
    onChange({
      ...scenario,
      [field]: isNaN(num) ? 0 : num,
    });
  };

  const setPeriod = (p: LeasePeriod) => {
    onChange({ ...scenario, period: p });
  };

  const toggleBool = (field: "capitalizeInstallation" | "includeMaintenanceInLease") => {
    onChange({ ...scenario, [field]: !scenario[field] });
  };

  const loadStandardPreset = () => {
    onChange({
      ...scenario,
      investmentAmount: 100000,
      period: 5,
      installationCosts: 5000,
      maintenanceCosts: 1000,
      residualValue: 25000,
      capitalizeInstallation: true,
      includeMaintenanceInLease: true,
    });
  };

  const loadPreset10Y = () => {
    onChange({
      ...scenario,
      investmentAmount: 150000,
      period: 10,
      installationCosts: 12000,
      maintenanceCosts: 1800,
      residualValue: 30000,
      capitalizeInstallation: true,
      includeMaintenanceInLease: true,
    });
  };

  // Helper to format currency values in input state easily
  const formatInputLabel = (val: number) => {
    return val.toLocaleString("nl-NL");
  };

  const accentRing = "focus:border-cerulean focus:ring-cerulean/20";
  const badgeBg = "bg-celadon/40 text-yale-blue font-extrabold";
  const borderHighlight = "border-dust-grey hover:border-cerulean";
  const buttonActive = "bg-yale-blue text-white hover:bg-cerulean";

  return (
    <div id={`scenario-card-${scenario.id}`} className="bg-white rounded-3xl border-2 border-slate-200 p-5 flex flex-col shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Scenario header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cerulean animate-pulse" />
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider uppercase ${badgeBg}`}>
            {title}
          </span>
          <input
            type="text"
            id={`input-name-${scenario.id}`}
            value={scenario.name}
            onChange={(e) => onChange({ ...scenario, name: e.target.value })}
            className="font-sans font-extrabold text-slate-800 text-xs bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-500 focus:outline-none px-1 py-0.5 w-32 transition-colors shrink"
            placeholder="Scenario naam"
          />
        </div>

        {/* Presets load */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            id={`btn-preset-5y-${scenario.id}`}
            onClick={loadStandardPreset}
            className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5 cursor-pointer"
            title="Laad het standaardvoorbeeld uit het gele screenshot (€100.000 / 5 jaar)"
          >
            <Sparkles className="w-2 h-2" />
            <span>5jr</span>
          </button>
          <button
            type="button"
            id={`btn-preset-10y-${scenario.id}`}
            onClick={loadPreset10Y}
            className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5 cursor-pointer"
            title="Laad een 10 jaar voorbeeld"
          >
            <span>10jr</span>
          </button>
        </div>
      </div>

      <div className="space-y-3 flex-grow flex flex-col justify-between">
        {/* Investeringsbedrag */}
        <div className="space-y-0.5">
          <label htmlFor={`input-inv-${scenario.id}`} className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Investeringsbedrag (Machine)</span>
            <span className="font-normal text-slate-400 text-[8px]">Excl. BTW</span>
          </label>
          <div className="relative rounded-lg shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <span className="text-slate-400 text-xs font-semibold">€</span>
            </div>
            <input
              type="text"
              name={`investmentAmount-${scenario.id}`}
              id={`input-inv-${scenario.id}`}
              value={formatInputLabel(scenario.investmentAmount)}
              onChange={(e) => handleNumChange("investmentAmount", e.target.value)}
              className={`block w-full pl-6 pr-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 font-bold text-slate-800 ${accentRing}`}
              placeholder="0"
            />
          </div>
        </div>

        {/* Period Selection (5 or 10 years Buttons) */}
        <div className="space-y-0.5">
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            Leaseperiode (Looptijd)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id={`btn-period-5y-${scenario.id}`}
              onClick={() => setPeriod(5)}
              className={`py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                scenario.period === 5
                  ? `${buttonActive} border-transparent shadow-xs`
                  : "bg-white border-slate-200 text-slate-705 hover:bg-slate-50"
              }`}
            >
              5 Jaar (60 mnd)
            </button>
            <button
              type="button"
              id={`btn-period-10y-${scenario.id}`}
              onClick={() => setPeriod(10)}
              className={`py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                scenario.period === 10
                  ? `${buttonActive} border-transparent shadow-xs`
                  : "bg-white border-slate-200 text-slate-705 hover:bg-slate-50"
              }`}
            >
              10 Jaar (120 mnd)
            </button>
          </div>
        </div>

        {/* Installatie & Onderhoud - side by side */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <label htmlFor={`input-inst-${scenario.id}`} className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Installatiekosten
            </label>
            <div className="relative rounded-lg shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <span className="text-slate-400 text-xs font-semibold">€</span>
              </div>
              <input
                type="text"
                id={`input-inst-${scenario.id}`}
                value={formatInputLabel(scenario.installationCosts)}
                onChange={(e) => handleNumChange("installationCosts", e.target.value)}
                className={`block w-full pl-6 pr-2 py-1 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 text-slate-800 ${accentRing}`}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-0.5">
            <label htmlFor={`input-maint-${scenario.id}`} className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Onderhoud per jaar
            </label>
            <div className="relative rounded-lg shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <span className="text-slate-400 text-xs font-semibold">€</span>
              </div>
              <input
                type="text"
                id={`input-maint-${scenario.id}`}
                value={formatInputLabel(scenario.maintenanceCosts)}
                onChange={(e) => handleNumChange("maintenanceCosts", e.target.value)}
                className={`block w-full pl-6 pr-2 py-1 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 text-slate-800 ${accentRing}`}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Restwaarde */}
        <div className="space-y-0.5">
          <label htmlFor={`input-res-${scenario.id}`} className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Restwaarde na {scenario.period} Jaar</span>
            <span className="font-normal text-slate-400">
              {scenario.investmentAmount > 0
                ? `${Math.round((scenario.residualValue / scenario.investmentAmount) * 100)}%`
                : ""}
            </span>
          </label>
          <div className="relative rounded-lg shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <span className="text-slate-400 text-xs font-semibold">€</span>
            </div>
            <input
              type="text"
              id={`input-res-${scenario.id}`}
              value={formatInputLabel(scenario.residualValue)}
              onChange={(e) => handleNumChange("residualValue", e.target.value)}
              className={`block w-full pl-6 pr-2 py-1 text-xs border font-bold text-slate-800 border-slate-200 rounded-lg focus:outline-none focus:ring-2 ${accentRing}`}
              placeholder="0"
            />
          </div>
        </div>

        {/* Additional Lease Toggles - Financial vs Operational layout */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5 mt-2">
          {/* Capitalize installation toggle */}
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="pr-4">
              <span className="text-xs font-bold text-slate-700 block">
                Financier ook installatiekosten
              </span>
              <span className="text-[10px] text-slate-450 block leading-tight">
                Meeleasen in het maandbedrag i.p.v. vooraf betalen
              </span>
            </div>
            <button
              type="button"
              id={`toggle-cap-${scenario.id}`}
              onClick={() => toggleBool("capitalizeInstallation")}
              className="text-slate-500 hover:text-slate-750 transition-colors focus:outline-none shrink-0 cursor-pointer"
            >
              {scenario.capitalizeInstallation ? (
                <ToggleRight className="w-8 h-8 text-cerulean fill-celadon/30" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-300" />
              )}
            </button>
          </label>

          {/* Include maintenance in lease payment toggle */}
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="pr-4">
              <span className="text-xs font-bold text-slate-700 block">
                Neem onderhoud op in periodiek bedrag
              </span>
              <span className="text-[10px] text-slate-455 block leading-tight">
                Simuleert operational lease (geïndexeerd met inflatie)
              </span>
            </div>
            <button
              type="button"
              id={`toggle-maint-${scenario.id}`}
              onClick={() => toggleBool("includeMaintenanceInLease")}
              className="text-slate-500 hover:text-slate-755 transition-colors focus:outline-none shrink-0 cursor-pointer"
            >
              {scenario.includeMaintenanceInLease ? (
                <ToggleRight className="w-8 h-8 text-cerulean fill-celadon/30" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-300" />
              )}
            </button>
          </label>
        </div>
      </div>
    </div>
  );
};
