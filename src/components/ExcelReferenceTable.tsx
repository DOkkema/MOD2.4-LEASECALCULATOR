import React from "react";
import { LeaseSettings } from "../types";
import { Info, RotateCcw, AlertTriangle } from "lucide-react";

interface ExcelReferenceTableProps {
  settings: LeaseSettings;
  onChange: (newSettings: LeaseSettings) => void;
  onReset: () => void;
}

const DEFAULTS: Record<keyof LeaseSettings, number> = {
  euribor: 2.87,
  opslagBank: 3.00,
  opslagLease5Y: 3.50,
  opslagLease10Y: 3.90,
  inflationRate: 2.009,
};

export const ExcelReferenceTable: React.FC<ExcelReferenceTableProps> = ({
  settings,
  onChange,
  onReset,
}) => {
  const handleNumChange = (field: keyof LeaseSettings, valStr: string) => {
    const num = parseFloat(valStr);
    if (!isNaN(num)) {
      const updated = { ...settings, [field]: num };
      // If euribor changed, recalculate inflation automatically as euribor * 0.7 (rounded to 3 decimals)
      if (field === "euribor") {
        updated.inflationRate = Math.round(num * 0.7 * 1000) / 1000;
      }
      onChange(updated);
    }
  };

  const isChanged = (field: keyof LeaseSettings, val: number) => {
    return Math.abs(val - DEFAULTS[field]) > 0.0001;
  };

  const anyChanged = 
    isChanged("euribor", settings.euribor) ||
    isChanged("opslagBank", settings.opslagBank) ||
    isChanged("opslagLease5Y", settings.opslagLease5Y) ||
    isChanged("opslagLease10Y", settings.opslagLease10Y) ||
    isChanged("inflationRate", settings.inflationRate);

  const renteBank = Math.round((settings.euribor + settings.opslagBank) * 105) / 105; // rounded
  const renteLease5 = Math.round((settings.euribor + settings.opslagLease5Y) * 100) / 100;
  const renteLease10 = Math.round((settings.euribor + settings.opslagLease10Y) * 100) / 100;

  return (
    <div id="excel-reference-card" className={`bg-white rounded-3xl border-2 transition-all duration-300 p-6 flex flex-col shadow-sm hover:shadow-md ${anyChanged ? 'border-amber-400 bg-amber-50/5' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${anyChanged ? 'bg-amber-500 animate-bounce' : 'bg-emerald-500 animate-pulse'}`} />
          <h3 className="font-sans font-extrabold text-slate-800 text-sm tracking-tight uppercase text-[12px] tracking-wider">
            Rentecorrecties & Instellingen
          </h3>
        </div>
        <button
          onClick={onReset}
          id="btn-reset-settings"
          title="Herstel naar standaardwaarden"
          className={`text-[10px] flex items-center gap-1 transition-colors px-2.5 py-1 rounded-md focus:outline-none cursor-pointer font-bold ${anyChanged ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-150 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
        >
          <RotateCcw className="w-3 h-3" />
          <span>Herstel defaults</span>
        </button>
      </div>

      <div>
        <p className="text-[11px] text-slate-450 mb-3 leading-relaxed">
          Onderstaande rentetarieven worden direct toegepast op de leaseberekeningen. 
          De inflatie wordt automatisch berekend als <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">Euribor * 0,7</code> maar kan ook handmatig worden aangepast.
        </p>

        {anyChanged && (
          <div className="mb-4 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2 text-[10px] text-amber-800 font-bold uppercase tracking-wider animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Afwijkende (custom) tarieven actief!</span>
          </div>
        )}

        {/* Excel spreadsheet reproduction */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-250">
                <th className="p-2.5 border-r border-slate-200 font-bold text-[10px] uppercase tracking-wider text-slate-400">Parameter</th>
                <th className="p-2.5 border-r border-slate-200 font-bold text-slate-700 text-right w-1/3 text-[10px] uppercase tracking-wider">
                  Rente + Opslag
                </th>
                <th className="p-2.5 font-bold text-slate-700 text-right w-1/3 text-[10px] uppercase tracking-wider">
                  Te Wijzigen Opslag
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Euribor row with light green background */}
              <tr className={`border-b border-slate-250 transition-colors ${isChanged("euribor", settings.euribor) ? 'bg-amber-50/40' : ''}`}>
                <td className="p-2.5 font-semibold text-slate-700 border-r border-slate-200 bg-slate-50/50">
                  Euribor (referentierente)
                </td>
                <td className={`p-2 border-r border-slate-200 text-right font-medium ${isChanged("euribor", settings.euribor) ? 'bg-amber-100/30' : 'bg-emerald-50/30'}`}>
                  <div className="flex items-center justify-end gap-1.5">
                    <input
                      type="number"
                      step="0.01"
                      id="input-euribor"
                      value={settings.euribor}
                      onChange={(e) => handleNumChange("euribor", e.target.value)}
                      className={`w-16 bg-transparent text-right font-extrabold border-none outline-none focus:ring-1 rounded px-1 ${isChanged("euribor", settings.euribor) ? 'text-amber-800 focus:ring-amber-400' : 'text-emerald-800 focus:ring-emerald-400'}`}
                    />
                    <span className={isChanged("euribor", settings.euribor) ? 'text-amber-700 font-bold font-mono' : 'text-emerald-700 font-bold font-mono'}>%</span>
                  </div>
                </td>
                <td className="p-2 text-right text-slate-400 bg-slate-50/10 font-mono font-medium	 italic">referentie</td>
              </tr>

              {/* Rente bank row */}
              <tr className={`border-b border-slate-200 transition-colors ${isChanged("opslagBank", settings.opslagBank) ? 'bg-amber-50/40' : ''}`}>
                <td className="p-2.5 font-semibold text-slate-700 border-r border-slate-200 bg-slate-50/50">
                  rente bank
                </td>
                <td className="p-2.5 border-r border-slate-200 text-right font-mono font-bold text-slate-700">
                  {(settings.euribor + settings.opslagBank).toFixed(2)}%
                </td>
                <td className={`p-2 text-right ${isChanged("opslagBank", settings.opslagBank) ? 'bg-amber-100/30' : ''}`}>
                  <div className="flex items-center justify-end gap-1">
                    <input
                      type="number"
                      step="0.01"
                      id="input-opslag-bank"
                      value={settings.opslagBank}
                      onChange={(e) => handleNumChange("opslagBank", e.target.value)}
                      className={`w-12 text-right border-none outline-none focus:ring-1 rounded px-1 font-extrabold ${isChanged("opslagBank", settings.opslagBank) ? 'text-amber-800 focus:ring-amber-500 bg-amber-100/20' : 'text-slate-800 focus:ring-indigo-400'}`}
                    />
                    <span className={isChanged("opslagBank", settings.opslagBank) ? 'text-amber-700 font-bold font-mono' : 'text-slate-500 font-mono'}>%</span>
                  </div>
                </td>
              </tr>

              {/* Rente lease 5 jaar row */}
              <tr className={`border-b border-slate-200 transition-colors ${isChanged("opslagLease5Y", settings.opslagLease5Y) ? 'bg-amber-50/40' : ''}`}>
                <td className="p-2.5 font-semibold text-slate-700 border-r border-slate-200 bg-slate-50/50">
                  rente lease 5 jaar (opslag)
                </td>
                <td className={`p-2.5 border-r border-slate-200 text-right font-mono font-extrabold ${isChanged("opslagLease5Y", settings.opslagLease5Y) ? 'text-amber-800' : 'text-indigo-755'}`}>
                  {renteLease5.toFixed(2)}%
                </td>
                <td className={`p-2 text-right ${isChanged("opslagLease5Y", settings.opslagLease5Y) ? 'bg-amber-100/30' : ''}`}>
                  <div className="flex items-center justify-end gap-1">
                    <input
                      type="number"
                      step="0.01"
                      id="input-opslag-lease5y"
                      value={settings.opslagLease5Y}
                      onChange={(e) => handleNumChange("opslagLease5Y", e.target.value)}
                      className={`w-12 text-right border-none outline-none focus:ring-1 rounded px-1 font-extrabold ${isChanged("opslagLease5Y", settings.opslagLease5Y) ? 'text-amber-800 focus:ring-amber-500 bg-amber-100/20' : 'text-slate-800 focus:ring-indigo-400'}`}
                    />
                    <span className={isChanged("opslagLease5Y", settings.opslagLease5Y) ? 'text-amber-700 font-bold font-mono' : 'text-slate-500 font-mono'}>%</span>
                  </div>
                </td>
              </tr>

              {/* Rente lease 10 jaar row */}
              <tr className={`border-b border-slate-200 transition-colors ${isChanged("opslagLease10Y", settings.opslagLease10Y) ? 'bg-amber-50/40' : ''}`}>
                <td className="p-2.5 font-semibold text-slate-700 border-r border-slate-200 bg-slate-50/50">
                  rente lease 10 jaar (opslag)
                </td>
                <td className={`p-2.5 border-r border-slate-200 text-right font-mono font-extrabold ${isChanged("opslagLease10Y", settings.opslagLease10Y) ? 'text-amber-800' : 'text-amber-755'}`}>
                  {renteLease10.toFixed(2)}%
                </td>
                <td className={`p-2 text-right ${isChanged("opslagLease10Y", settings.opslagLease10Y) ? 'bg-amber-100/30' : ''}`}>
                  <div className="flex items-center justify-end gap-1">
                    <input
                      type="number"
                      step="0.01"
                      id="input-opslag-lease10y"
                      value={settings.opslagLease10Y}
                      onChange={(e) => handleNumChange("opslagLease10Y", e.target.value)}
                      className={`w-12 text-right border-none outline-none focus:ring-1 rounded px-1 font-extrabold ${isChanged("opslagLease10Y", settings.opslagLease10Y) ? 'text-amber-800 focus:ring-amber-500 bg-amber-100/20' : 'text-slate-800 focus:ring-indigo-400'}`}
                    />
                    <span className={isChanged("opslagLease10Y", settings.opslagLease10Y) ? 'text-amber-700 font-bold font-mono' : 'text-slate-500 font-mono'}>%</span>
                  </div>
                </td>
              </tr>

              {/* Inflatie row */}
              <tr className={`border-b-0 transition-colors ${isChanged("inflationRate", settings.inflationRate) ? 'bg-amber-50/40' : ''}`}>
                <td className="p-2.5 font-semibold text-slate-700 border-r border-slate-200 bg-slate-50/50">
                  inflatie
                </td>
                <td className="p-2 text-right border-r border-slate-200 font-mono text-slate-700">
                  {settings.inflationRate}%
                </td>
                <td className={`p-2 text-right ${isChanged("inflationRate", settings.inflationRate) ? 'bg-amber-100/30' : ''}`}>
                  <div className="flex items-center justify-end gap-1">
                    <input
                      type="number"
                      step="0.001"
                      id="input-inflation"
                      value={settings.inflationRate}
                      onChange={(e) => handleNumChange("inflationRate", e.target.value)}
                      className={`w-16 text-right border-none outline-none focus:ring-1 rounded px-1 font-bold ${isChanged("inflationRate", settings.inflationRate) ? 'text-amber-800 focus:ring-amber-500 bg-amber-100/20' : 'text-slate-800 focus:ring-indigo-400'}`}
                    />
                    <span className={isChanged("inflationRate", settings.inflationRate) ? 'text-amber-700 font-bold font-mono' : 'text-slate-500 font-mono'}>%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Helpful calculations info banner */}
        <div className="mt-4 p-3.5 bg-celadon/20 rounded-2xl border border-celadon/50 flex gap-2.5 items-start">
          <Info className="w-4 h-4 text-cerulean shrink-0 mt-0.5" />
          <div className="text-[11px] text-yale-blue space-y-1">
            <p className="font-bold">Actieve rentes (Euribor + Opslag):</p>
            <ul className="list-disc pl-3 text-slate-650 space-y-0.5">
              <li>Lease 5 jaar rentetactiek: <strong className="text-slate-900">{renteLease5}%</strong></li>
              <li>Lease 10 jaar rentetactiek: <strong className="text-slate-900">{renteLease10}%</strong></li>
              <li>Bankfinanciering (referentie): <strong className="text-slate-900">{(settings.euribor + settings.opslagBank).toFixed(2)}%</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
