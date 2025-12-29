
import React, { useState, useEffect, useRef } from 'react';
import { Ritual, RitualStep, UserProfile } from '../types';
import { PANDIT_VOICES } from '../constants';
import { generateRitualFlow, getPanditAudio } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { Play, Pause, SkipForward, SkipBack, Loader2, Volume2, Info, Settings2, AlertCircle, Flower } from 'lucide-react';

interface PoojaPlayerProps {
  ritual: Ritual;
  user: UserProfile;
  onClose: () => void;
}

const PoojaPlayer: React.FC<PoojaPlayerProps> = ({ ritual, user, onClose }) => {
  const [steps, setSteps] = useState<RitualStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(PANDIT_VOICES[0].id);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const fetchFlow = async () => {
      setLoading(true);
      setError(null);
      try {
        const flow = await generateRitualFlow(ritual.title, user);
        setSteps(flow);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Could not generate ritual flow. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchFlow();
  }, [ritual, user]);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {}
      audioSourceRef.current = null;
    }
    setPlaying(false);
  };

  const playCurrentStep = async () => {
    if (!steps[currentStepIndex]) return;
    
    setAudioLoading(true);
    setError(null);
    const step = steps[currentStepIndex];
    const textToSpeak = `${step.title}. ${step.instruction}. Mantra: ${step.mantra}`;
    
    try {
      const base64Audio = await getPanditAudio(textToSpeak, selectedVoice);
      if (!base64Audio) {
        throw new Error("The Pandit's voice is unavailable. This may be due to a temporary service issue or a spiritual text filter. Please try a different step or voice.");
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        audioContextRef.current,
        24000,
        1
      );

      stopAudio();

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setPlaying(false);
      
      audioSourceRef.current = source;
      source.start(0);
      setPlaying(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate audio.");
    } finally {
      setAudioLoading(false);
    }
  };

  const nextStep = () => {
    stopAudio();
    setError(null);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const prevStep = () => {
    stopAudio();
    setError(null);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-orange-800">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-xl font-marcellus">Consulting with the Pandit... generating your Sankalpam</p>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onClose} className="text-orange-900 font-bold hover:underline flex items-center gap-2">
          <span>←</span> Back to Rituals
        </button>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-full transition ${showSettings ? 'bg-orange-200 text-orange-900' : 'text-orange-700 hover:bg-orange-100'}`}
          >
            <Settings2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-orange-50 p-6 rounded-2xl mb-8 border border-orange-200 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-orange-900 font-bold mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5" /> Select Pandit Voice
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {PANDIT_VOICES.map(voice => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  selectedVoice === voice.id 
                    ? 'border-orange-500 bg-white shadow-md' 
                    : 'border-orange-100 bg-orange-50 hover:border-orange-200'
                }`}
              >
                <div className="font-bold text-orange-900">{voice.name}</div>
                <div className="text-xs text-orange-600">{voice.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {currentStep && (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">
          <div className="spiritual-gradient p-12 text-center text-white relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-20">
               <Flower className="w-32 h-32" />
            </div>
            <span className="relative inline-block px-4 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <h2 className="relative text-3xl font-marcellus mb-2">{currentStep.title}</h2>
            <p className="relative text-orange-100 italic">{currentStep.isSankalpam ? "Initiation & Intention" : "Pooja Upachara"}</p>
          </div>

          <div className="p-8 md:p-12 space-y-8">
            <div className="bg-orange-50 p-6 rounded-2xl border-l-4 border-orange-500">
              <h3 className="text-sm font-bold text-orange-800 uppercase mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" /> Instructions
              </h3>
              <p className="text-orange-900 leading-relaxed text-lg">
                {currentStep.instruction}
              </p>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-sm font-bold text-orange-400 uppercase">Mantra</h3>
              <p className="text-2xl md:text-3xl font-marcellus text-orange-900 leading-snug">
                {currentStep.mantra}
              </p>
            </div>

            <div className="pt-8 flex flex-col items-center gap-8">
              <div className="flex items-center gap-6">
                <button 
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="p-4 text-orange-600 hover:bg-orange-50 rounded-full disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <SkipBack className="w-8 h-8 fill-current" />
                </button>

                <button 
                  onClick={playing ? stopAudio : playCurrentStep}
                  disabled={audioLoading}
                  className="w-20 h-20 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-700 transition transform hover:scale-105 disabled:bg-orange-300"
                >
                  {audioLoading ? (
                    <Loader2 className="w-10 h-10 animate-spin" />
                  ) : playing ? (
                    <Pause className="w-10 h-10 fill-current" />
                  ) : (
                    <Play className="w-10 h-10 fill-current translate-x-1" />
                  )}
                </button>

                <button 
                  onClick={nextStep}
                  disabled={currentStepIndex === steps.length - 1}
                  className="p-4 text-orange-600 hover:bg-orange-50 rounded-full disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <SkipForward className="w-8 h-8 fill-current" />
                </button>
              </div>
              
              <p className="text-sm text-orange-500 min-h-[1.25rem]">
                {playing ? "Reciting..." : audioLoading ? "Invoking the Pandit..." : "Press Play to hear the mantra"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoojaPlayer;
