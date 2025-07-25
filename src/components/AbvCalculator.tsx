import React, { useState, useMemo } from 'react';
import { CalculatorIcon } from './icons';

const AbvCalculator = () => {
  const [lmeKg, setLmeKg] = useState('1.0');
  const [volumeL, setVolumeL] = useState('5.7');
  const [finalGravity, setFinalGravity] = useState('1.010');

  const { originalGravity, abv } = useMemo(() => {
    const lme = parseFloat(lmeKg);
    const vol = parseFloat(volumeL);
    const fg = parseFloat(finalGravity);

    if (isNaN(lme) || isNaN(vol) || isNaN(fg) || vol <= 0) {
      return { originalGravity: 0, abv: 0 };
    }

    const gravityPoints = (lme * 309) / vol;
    const og = 1 + gravityPoints / 1000;
    
    const alcoholByVolume = (og - fg) * 131.25;

    return {
      originalGravity: og,
      abv: alcoholByVolume > 0 ? alcoholByVolume : 0,
    };
  }, [lmeKg, volumeL, finalGravity]);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 max-w-4xl mx-auto border border-slate-700">
      <div className="flex items-center mb-8">
        <CalculatorIcon className="w-9 h-9 text-cyan-400 mr-4" />
        <h2 className="text-4xl font-bold text-white">ABV Calculator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label htmlFor="lme" className="block text-lg font-medium text-slate-300 mb-2">
              Liquid Malt Extract (kg)
            </label>
            <input
              id="lme"
              type="number"
              step="0.1"
              min="0"
              value={lmeKg}
              onChange={(e) => setLmeKg(e.target.value)}
              className="w-full text-xl bg-slate-700/50 border-slate-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>
          <div>
            <label htmlFor="volume" className="block text-lg font-medium text-slate-300 mb-2">
              Brew Volume (L)
            </label>
            <input
              id="volume"
              type="number"
              step="0.1"
              min="0"
              value={volumeL}
              onChange={(e) => setVolumeL(e.target.value)}
              className="w-full text-xl bg-slate-700/50 border-slate-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>
          <div>
            <label htmlFor="fg" className="block text-lg font-medium text-slate-300 mb-2">
              Final Gravity (e.g., 1.010)
            </label>
            <input
              id="fg"
              type="number"
              step="0.001"
              min="0"
              value={finalGravity}
              onChange={(e) => setFinalGravity(e.target.value)}
              className="w-full text-xl bg-slate-700/50 border-slate-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>
        </div>

        {/* Results */}
        <div className="bg-slate-900/50 rounded-xl p-8 flex flex-col justify-center items-center text-center border border-slate-700">
            <p className="text-xl text-slate-400 uppercase tracking-wider font-semibold">Final ABV</p>
            <div className="relative my-4 w-56 h-56 flex items-center justify-center">
                <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-slate-700" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                    <circle 
                        className="text-cyan-400" 
                        strokeWidth="8" 
                        strokeDasharray="283" 
                        strokeDashoffset={283 - (abv/10) * 283}
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="45" 
                        cx="50" 
                        cy="50"
                        style={{transform: 'rotate(-90deg)', transformOrigin: 'center'}}
                    />
                </svg>
                <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold text-white">{abv.toFixed(2)}</span>
                    <span className="text-3xl font-extrabold text-white opacity-70">%</span>
                </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg py-2 px-4">
                <p className="text-lg text-slate-400">Estimated OG</p>
                <p className="text-4xl font-bold text-cyan-400">{originalGravity.toFixed(3)}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AbvCalculator;