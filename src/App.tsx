import { useState, useEffect } from "react";
import { LeaseSettings, LeaseScenario } from "./types";
import {
  calculateLease,
  DEFAULT_SETTINGS,
  DEFAULT_SCENARIO_1,
} from "./utils/calculator";
import { ExcelReferenceTable } from "./components/ExcelReferenceTable";
import { ScenarioForm } from "./components/ScenarioForm";
import { YearlyComparisonTable } from "./components/YearlyComparisonTable";
import brandLogo from "./assets/images/de_hoge_zeeen_logo_1781261341825.jpg";
import { 
  Calculator, 
  TrendingUp, 
  Coins, 
  HelpCircle,
  FileCheck2,
  Bookmark,
  Printer,
  Download,
  Loader2,
  Percent,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  Sliders
} from "lucide-react";

export default function App() {
  // Interest rates & settings
  const [settings, setSettings] = useState<LeaseSettings>(() => {
    const saved = localStorage.getItem("lease-settings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Scenario state (single scenario only now)
  const [scenario, setScenario] = useState<LeaseScenario>(() => {
    const saved = localStorage.getItem("lease-scenarios-single") || localStorage.getItem("lease-scenarios");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const obj = Array.isArray(parsed) ? parsed[0] : parsed;
        if (obj && typeof obj === "object") {
          return {
            ...DEFAULT_SCENARIO_1,
            ...obj,
            name: "Scenario 1"
          };
        }
      } catch (e) {
        // Fall back to default
      }
    }
    return DEFAULT_SCENARIO_1;
  });

  // Local storage persist
  useEffect(() => {
    localStorage.setItem("lease-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("lease-scenarios-single", JSON.stringify(scenario));
  }, [scenario]);

  const handleSettingsChange = (newSettings: LeaseSettings) => {
    setSettings(newSettings);
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const handleScenarioChange = (updated: LeaseScenario) => {
    setScenario(updated);
  };

  // Run calculation over current state
  const result = calculateLease(scenario, settings);

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatEuroDecimal = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const printDocument = () => {
    window.print();
  };

  const scrollToSettings = () => {
    const element = document.getElementById("rates-settings");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportStandaloneHtml = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const response = await fetch("/api/export");
      if (!response.ok) {
        throw new Error(`Download mislukt met status ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "lease-calculator-portable.html");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setExportError(err.message || "Onbekende fout bij export.");
    } finally {
      setExporting(false);
    }
  };

  const hasMaint = scenario.includeMaintenanceInLease;
  const monthlyLeaseVal = hasMaint ? result.totalMonthlyPaymentYear1 : result.monthlyLeaseExclMaintenance;
  const yearlyLeaseVal = monthlyLeaseVal * 12;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans">
      {/* Decorative colored bar */}
      <div className="h-2 bg-gradient-to-r from-celadon via-cerulean to-yale-blue" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6 animate-fade-in">
        
        {/* Header Title Section with Integrated Key Financial Rates Badges */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm" id="header-container">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl border-2 border-celadon overflow-hidden flex items-center justify-center shadow-xs">
                <img 
                  src={brandLogo} 
                  className="w-full h-full object-cover" 
                  alt="De hoge zeeën logo" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-cerulean block font-mono">
                  Maritieme Lease-Systemen
                </span>
                <h1 className="font-sans font-extrabold text-yale-blue text-2xl lg:text-3xl tracking-tight leading-none mt-0.5">
                  De hoge zeeën
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed mt-1">
              Bereken uw dekkingsgraad en periodieke lasten voor maritieme investeringen en zware kranen. Live renteberekeningen gekoppeld aan Euribor.
            </p>
          </div>

          {/* Rate status markers in header */}
          <div className="flex flex-wrap items-center gap-3 self-stretch lg:self-auto">
            <div className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-left shrink-0">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Euribor</span>
              <span className="text-sm font-extrabold font-mono text-slate-700">{settings.euribor.toFixed(2)}%</span>
            </div>
            <div className="px-3 py-1.5 bg-celadon/25 rounded-xl border border-celadon/50 text-left shrink-0">
              <span className="text-[9px] uppercase tracking-wider font-bold text-yale-blue/70 block">Bankrente</span>
              <span className="text-sm font-extrabold font-mono text-yale-blue">{(settings.euribor + settings.opslagBank).toFixed(2)}%</span>
            </div>
            <div className="px-3 py-1.5 bg-cerulean/10 rounded-xl border border-cerulean/30 text-left shrink-0">
              <span className="text-[9px] uppercase tracking-wider font-bold text-cerulean block">Lease 5jr Rente</span>
              <span className="text-sm font-extrabold font-mono text-yale-blue">{(settings.euribor + settings.opslagLease5Y).toFixed(2)}%</span>
            </div>
            <div className="px-3 py-1.5 bg-yale-blue/10 rounded-xl border border-yale-blue/30 text-left shrink-0">
              <span className="text-[9px] uppercase tracking-wider font-bold text-yale-blue block">Lease 10jr Rente</span>
              <span className="text-sm font-extrabold font-mono text-yale-blue">{(settings.euribor + settings.opslagLease10Y).toFixed(2)}%</span>
            </div>

            <button
              onClick={scrollToSettings}
              id="btn-scroll-to-settings"
              className="px-3 py-1.5 text-xs font-bold text-yale-blue bg-white hover:bg-slate-50 border border-slate-200 hover:border-cerulean rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer lg:ml-1"
              title="Pas de rentetarieven, Euribor en overige calculatorinstellingen aan"
            >
              <Sliders className="w-3.5 h-3.5 text-cerulean" />
              <span>Aanpassen</span>
            </button>

            <button
              onClick={printDocument}
              id="btn-print-page"
              className="px-4 py-2 text-xs font-bold text-white bg-yale-blue hover:bg-cerulean rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer lg:ml-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Afdrukken</span>
            </button>
          </div>
        </div>

        {/* Main 12-Column Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Bento Box 1: Scenario configuration form (6 cols) */}
          <div className="lg:col-span-6 flex flex-col">
            <ScenarioForm
              scenario={scenario}
              onChange={handleScenarioChange}
              title="Lease Parameters"
              accentColor="indigo"
            />
          </div>          {/* Bento Box 2: Outcome card for this single scenario (6 cols) */}
          <div className="lg:col-span-6 bg-yale-blue text-white rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow duration-300">
            {/* Decors */}
            <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-cerulean rounded-full opacity-20 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-5" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-celadon">
                  Lease Uitkomsten • {scenario.name}
                </span>
                <span className="flex items-center gap-1 bg-cerulean/50 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-celadon/30 text-celadon">
                  <ShieldCheck className="w-3 h-3 text-celadon" />
                  Gevalideerd
                </span>
              </div>

              {/* Giant results readout */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-cerulean/50">
                <div className="space-y-0.5">
                  <span className="block text-[10px] uppercase tracking-wider text-celadon font-bold">
                    {hasMaint ? "Per maand (inc. maint)" : "Per maand (ex. maint)"}
                  </span>
                  <h3 className="text-3xl font-extrabold tracking-tight text-white font-sans">
                    {formatEuroDecimal(monthlyLeaseVal)}
                  </h3>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[10px] uppercase tracking-wider text-celadon font-bold">
                    {hasMaint ? "Per jaar (inc. maint)" : "Per jaar (ex. maint)"}
                  </span>
                  <h3 className="text-3xl font-extrabold tracking-tight text-celadon font-sans">
                    {formatEuroDecimal(yearlyLeaseVal)}
                  </h3>
                </div>
              </div>

              {/* Inner detail cards snippet */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-cerulean/30 p-3 rounded-2xl border border-cerulean/30">
                  <span className="block text-[10px] opacity-75 uppercase text-celadon">Rentevoet</span>
                  <span className="font-extrabold text-[13px] font-mono mt-0.5 block text-white">{(result.interestRate * 100).toFixed(2)}%</span>
                </div>
                <div className="bg-cerulean/30 p-3 rounded-2xl border border-cerulean/30">
                  <span className="block text-[10px] opacity-75 uppercase text-celadon">Looptijd</span>
                  <span className="font-extrabold text-[13px] mt-0.5 block text-white">{scenario.period} Jaar</span>
                </div>
                <div className="bg-cerulean/30 p-3 rounded-2xl border border-cerulean/30">
                  <span className="block text-[10px] opacity-75 uppercase text-celadon">Meegefinancierd</span>
                  <span className="font-extrabold text-[13px] mt-0.5 block text-white">
                    {scenario.capitalizeInstallation ? "Installatie" : "Alleen machine"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-cerulean/50 flex justify-between items-center text-xs relative z-10 text-celadon font-medium">
              <div>
                <span className="block opacity-75 text-[10px] uppercase">Totale leaselast over looptijd</span>
                <span className="font-extrabold text-white text-base block mt-0.5">
                  {formatEuro(result.totalCostInclMaintenance)}
                </span>
              </div>
              <div className="text-right">
                <span className="block opacity-75 text-[10px] uppercase">Restwaarde ({scenario.period} jr)</span>
                <span className="font-bold text-white text-base block mt-0.5">
                  {formatEuro(scenario.residualValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Bento Box 7: Yearly comparison details tables (12 cols) */}
          <div className="lg:col-span-12">
            <YearlyComparisonTable scenario={scenario} result={result} />
          </div>

          {/* FOURTH ROW: FORMULA LOGIC AND SPREADSHEET RATES SITES */}
          
          {/* Bento Box 8: Spreadsheet parameters configuration (6 cols) */}
          <div className="lg:col-span-6 flex flex-col animate-fade-in" id="rates-settings">
            <ExcelReferenceTable
              settings={settings}
              onChange={handleSettingsChange}
              onReset={handleResetSettings}
            />
          </div>

          {/* Bento Box 9: Dynamic Information card (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-3">
              <h4 className="font-sans font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-cerulean" />
                Informatie over berekening
              </h4>
              <div className="text-xs text-slate-650 space-y-3 leading-relaxed">
                <p>
                  <strong>Boekhoudkundige Waardebepaling:</strong> De machine-waarde per jaar wordt berekend op basis van lineaire afschrijving van de initiële aanschafwaarde (investering + installatie) naar de ingevulde restwaarde.
                </p>
                <p>
                  <strong>Maandfactuur vs. Jaaroverzicht:</strong> Maandbedragen worden berekend middels een maandelijkse annuïteitenformule. Het rentedeel is gekoppeld aan de geselecteerde looptijd ({scenario.period === 5 ? "6,37%" : "6,77%"} bij standaard Euribor).
                </p>
                <p>
                  <strong>Indexering van onderhoud:</strong> Indien ingeschakeld, stijgt het jaarlijkse onderhoudsdeel mee met de berekende inflatie (<strong className="text-slate-850 font-bold">{settings.inflationRate}%</strong>) om operationele realiteit na te bootsen.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-3 text-[11px] text-slate-400 italic">
              <div className="w-2 h-2 rounded-full bg-celadon animate-pulse" />
              <span>Gecalculeerde data synchroniseert direct met de browser's LocalStorage.</span>
            </div>
          </div>

        </div>

        {/* Subtle Footer with Export Standalone widget */}
        <div className="pt-8 mt-12 border-t border-slate-200 flex flex-col items-center gap-4 text-center">
          {exportError && (
            <div className="bg-rose-50 border border-rose-150 rounded-xl p-3 text-xs text-rose-800 flex justify-between items-center max-w-md w-full animate-shake leading-relaxed">
              <div>
                <strong className="font-bold">Exporteren mislukt:</strong> {exportError}
              </div>
              <button 
                onClick={() => setExportError(null)} 
                className="font-bold text-rose-500 hover:text-rose-700 id-close-err focus:outline-none cursor-pointer px-1 text-[11px]"
              >
                Sluiten
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between w-full text-[11px] text-slate-400 gap-4 px-1 pb-4 animate-fade-in">
            <span className="italic text-slate-400">Automatische live berekening & opslag.</span>
            
            <button
              onClick={exportStandaloneHtml}
              disabled={exporting}
              id="btn-export-portable"
              className="text-yale-blue hover:text-cerulean bg-white border border-slate-200 hover:border-cerulean hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-[10.5px] disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-2xs shadow-slate-100/50"
              title="Download deze complete calculator als één standalone HTML-bestand dat offline bruikbaar is"
            >
              {exporting ? (
                <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
              ) : (
                <Download className="w-3 h-3 text-cerulean" />
              )}
              <span>Stand-alone Exporteren {exporting ? "(Bouwen...)" : "(Offline HTML)"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
