import * as React from 'react';
import { useState, useEffect } from 'react';
import { Save, Volume2, Clock, Truck, Sliders } from 'lucide-react';
import { triggerWebhook } from '../services/n8nService';

const Settings: React.FC = () => {
    const [tone, setTone] = useState('friendly');
    const [delay, setDelay] = useState(2);

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-white">AI Configuration</h1>
                <p className="text-brand-gray mt-1">Customize how your AI Agent behaves and interacts</p>
            </div>

            <div className="space-y-6">
                {/* Tone Settings */}
                <div className="bg-brand-card p-6 rounded-2xl border border-gray-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-brand-greenDim rounded-lg text-brand-green">
                            <Volume2 size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Communication Tone</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['Formal', 'Friendly', 'Tunisian Dialect'].map((t) => (
                            <div
                                key={t}
                                onClick={() => {
                                    setTone(t.toLowerCase());
                                    triggerWebhook({ action: 'update_settings', setting: 'tone', value: t.toLowerCase() });
                                }}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${tone === t.toLowerCase()
                                        ? 'border-brand-green bg-brand-green/10'
                                        : 'border-gray-700 hover:border-gray-500 bg-black/20'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`font-bold ${tone === t.toLowerCase() ? 'text-brand-green' : 'text-white'}`}>{t}</span>
                                    {tone === t.toLowerCase() && <div className="w-3 h-3 bg-brand-green rounded-full shadow-[0_0_10px_#10B981]"></div>}
                                </div>
                                <p className="text-xs text-gray-500">
                                    {t === 'Formal' ? 'Professional and concise responses.' :
                                        t === 'Friendly' ? 'Warm, engaging, and enthusiastic.' :
                                            'Natural Tunisian Derja for local authenticity.'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Operational Rules */}
                <div className="bg-brand-card p-6 rounded-2xl border border-gray-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-brand-orangeDim rounded-lg text-brand-orange">
                            <Sliders size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Operational Rules</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Standard Delivery Delay (Days)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="7"
                                    value={delay}
                                    onChange={(e) => setDelay(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-green"
                                />
                                <span className="font-mono text-xl font-bold text-white w-12 text-center">{delay}d</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">Used by AI when answering "When will I receive my order?"</p>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-700 rounded-xl">
                            <div>
                                <span className="block font-bold text-white text-sm">Auto-Confirm Orders</span>
                                <span className="text-xs text-gray-500">Automatically send "Order Confirmed" after receiving details</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={() => {
                            triggerWebhook({ action: 'update_settings', tone, delay, autoConfirm: true });
                            alert('Settings saved!');
                        }}
                        className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;