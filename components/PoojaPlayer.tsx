
import React, { useState, useEffect, useRef } from 'react';
import { Ritual, RitualStep, UserProfile } from '../types';
import { PANDIT_VOICES } from '../constants';
import { generateRitualFlow, getPanditAudio } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { Play, Pause, SkipForward, SkipBack, Loader2, Volume2, Info, Settings2 } from 'lucide-react';

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
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const fetchFlow = async () => {
      setLoading(true);
      try {
        const flow = await generateRitualFlow(ritual.title, user);
        setSteps(flow);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlow();
  }, [ritual, user]);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setPlaying(false);
  };

  const playCurrentStep = async () => {
    if (!steps[currentStepIndex]) return;
    
    setAudioLoading(true);
    const textToSpeak = `${steps[currentStepIndex].title}. ${steps[currentStepIndex].instruction}. Mantra: ${steps[currentStepIndex].mantra}`;
    
    try {
      const base64Audio = await getPanditAudio(textToSpeak, selectedVoice);
      if (!base64Audio) throw new Error("Audio generation failed");

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
    } catch (err) {
      console.error(err);
    } finally {
      setAudioLoading(false);
    }
  };

  const nextStep = () => {
    stopAudio();
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const prevStep = () => {
    stopAudio();
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
            <Settings2 className="w-5 h-5" />
          </button>
          <div className="text-right">
            <h2 className="text-xl md:text-2xl font-marcellus text-orange-900">{ritual.title}</h2>
            <p className="text-xs text-orange-700">Step {currentStepIndex + 1} of {steps.length}</p>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h4 className="text-sm font-bold text-orange-900 uppercase mb-4 flex items-center gap-2">
            <Volume2 className="w-4 h-4" /> Select Pandit Voice Style
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {PANDIT_VOICES.map((voice) => (
              <button
                key={voice.id}
                onClick={() => {
                  setSelectedVoice(voice.id);
                  stopAudio();
                }}
                className={`text-left p-4 rounded-xl border-2 transition ${
                  selectedVoice === voice.id 
                    ? 'border-orange-500 bg-white shadow-md' 
                    : 'border-orange-100 bg-orange-50 hover:bg-white hover:border-orange-200'
                }`}
              >
                <p className={`font-bold text-sm ${selectedVoice === voice.id ? 'text-orange-600' : 'text-orange-800'}`}>
                  {voice.name}
                </p>
                <p className="text-xs text-orange-500">{voice.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-orange-100 mb-8">
        <div className="p-8 md:p-12 text-center">
          <div className="mb-6">
            <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${currentStep.isSankalpam ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800'}`}>
              {currentStep.isSankalpam ? 'Sankalpam (Vow)' : 'Ritual Phase'}
            </span>
          </div>
          
          <h3 className="text-3xl font-marcellus text-orange-900 mb-6">{currentStep.title}</h3>
          
          <div className="bg-orange-50 rounded-2xl p-6 mb-8 border border-orange-200">
            <h4 className="text-xs font-bold text-orange-600 uppercase mb-2 flex items-center justify-center gap-2">
              <Info className="w-4 h-4" /> Instructions
            </h4>
            <p className="text-lg text-orange-900">{currentStep.instruction}</p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white p-8 rounded-2xl border-2 border-orange-200">
              <h4 className="text-xs font-bold text-orange-600 uppercase mb-4">Mantra</h4>
              <p className="text-2xl md:text-3xl font-marcellus text-orange-900 leading-relaxed italic">
                "{currentStep.mantra}"
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-900 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={prevStep} 
              disabled={currentStepIndex === 0}
              className="p-3 rounded-full bg-orange-800 text-white hover:bg-orange-700 disabled:opacity-50 transition"
            >
              <SkipBack className="w-6 h-6" />
            </button>
            
            <button 
              onClick={playing ? stopAudio : playCurrentStep}
              disabled={audioLoading}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-400 transition transform hover:scale-105 shadow-lg"
            >
              {audioLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : playing ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current ml-1" />
              )}
            </button>

            <button 
              onClick={nextStep}
              disabled={currentStepIndex === steps.length - 1}
              className="p-3 rounded-full bg-orange-800 text-white hover:bg-orange-700 disabled:opacity-50 transition"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-orange-200">
            <Volume2 className="w-5 h-5" />
            <span className="text-sm font-medium">Reciting: {PANDIT_VOICES.find(v => v.id === selectedVoice)?.name}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
          <h5 className="font-bold text-orange-800 mb-2">Devotee Details</h5>
          <p className="text-sm text-orange-700">Yajamana: {user.name}</p>
          <p className="text-sm text-orange-700">Gotra: {user.gotra}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
          <h5 className="font-bold text-orange-800 mb-2">Muhurta (Time)</h5>
          <p className="text-sm text-orange-700">Date: {new Date().toLocaleDateString()}</p>
          <p className="text-sm text-orange-700">Location: {user.location?.city || 'Vedic Realm'}</p>
        </div>
      </div>
    </div>
  );
};

export default PoojaPlayer;
