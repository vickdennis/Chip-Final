import React, { useState } from 'react';
import { SmartphoneNfc, CheckCircle, AlertTriangle, XCircle, Info, Loader2 } from 'lucide-react';

export default function NfcProgrammer({ profile }: { profile: any }) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const profileUrl = `https://chipng.com/${profile.username}`;

  const handleWriteNfc = async () => {
    if (!('NDEFReader' in window)) {
      setStatus('error');
      setErrorMessage('Web NFC is not supported in this browser. Please use Chrome for Android.');
      return;
    }

    try {
      setStatus('scanning');
      // @ts-ignore
      const ndef = new NDEFReader();
      await ndef.write({
        records: [{ recordType: 'url', data: profileUrl }]
      });
      setStatus('success');
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to write to NFC card. Make sure it is close to your phone.');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <div className="xl:col-span-8 flex flex-col gap-8">
        <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col overflow-hidden">
          <div className="border-b border-white/10 p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">
            <h3 className="font-mono text-[13px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <SmartphoneNfc className="w-4 h-4" />
              Program Your NFC Card
            </h3>
          </div>
          
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-300 rounded-2xl">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold mb-1">How it works</p>
                <p>You can use your Android smartphone to program any blank NFC tag or rewrite your existing CHIP NG card to point to your digital profile. This requires Chrome on an NFC-enabled Android device.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-white/40">URL to Program</label>
              <div className="p-3 bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-white/10 rounded-xl font-mono text-sm break-all">
                {profileUrl}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-[#f9f9f9] dark:bg-[#1a1a1a]">
              {status === 'idle' && (
                <>
                  <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <SmartphoneNfc className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold font-sans text-center mb-2">Ready to Program</h4>
                  <p className="text-white/40 text-sm text-center max-w-md mb-6">
                    Click the button below, then hold your NFC card against the back of your phone until it confirms.
                  </p>
                  <button 
                    onClick={handleWriteNfc}
                    className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-8 py-3 rounded-2xl font-bold transition-all shadow-md"
                  >
                    Start Programming
                  </button>
                </>
              )}

              {status === 'scanning' && (
                <>
                  <div className="relative mb-6">
                    <div className="absolute inset-0 border-4 border-black/20 dark:border-white/20 rounded-full animate-ping"></div>
                    <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg relative z-10 animate-pulse">
                      <SmartphoneNfc className="w-10 h-10" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold font-sans text-center mb-2">Scanning...</h4>
                  <p className="text-white/40 text-sm text-center max-w-md mb-6">
                    Hold your NFC card against the back of your phone.
                  </p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-2xl font-bold text-sm hover:bg-[#f9f9f9] dark:hover:bg-[#222]"
                  >
                    Cancel
                  </button>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold font-sans text-center mb-2">Successfully Programmed!</h4>
                  <p className="text-white/40 text-sm text-center max-w-md mb-6">
                    Your card now points directly to your CHIP NG profile.
                  </p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-8 py-3 rounded-2xl font-bold transition-all"
                  >
                    Program Another
                  </button>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold font-sans text-center mb-2">Programming Failed</h4>
                  <p className="text-red-600 dark:text-red-400 text-sm text-center max-w-md mb-6 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-100 dark:border-red-900">
                    {errorMessage}
                  </p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-8 py-3 rounded-2xl font-bold transition-all"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
      
      <div className="xl:col-span-4 flex flex-col gap-6">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-xl">
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Compatibility Note
          </h4>
          <p className="text-xs text-white/40 mb-3 leading-relaxed">
            Web NFC is currently only supported on Chrome for Android. iOS (iPhones) do not support writing to NFC tags via the web browser.
          </p>
          <p className="text-xs text-white/40 leading-relaxed">
            If you're using an iPhone, you'll need to use a dedicated app like "NFC Tools" to write your profile URL to your card.
          </p>
        </div>
      </div>
    </div>
  );
}
