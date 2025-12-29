
import React, { useState, useEffect } from 'react';
import { AppState, UserProfile, Ritual } from './types';
import { RITUALS } from './constants';
import PoojaPlayer from './components/PoojaPlayer';
import { User, MapPin, Sparkles, Flower, Wind, Compass } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.ONBOARDING);
  const [user, setUser] = useState<UserProfile>({ name: '', gotra: '' });
  const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);

  useEffect(() => {
    // Attempt to get location for Sankalpam
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUser(prev => ({
            ...prev,
            location: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              city: "Detected Location"
            }
          }));
        },
        () => console.log("Location access denied. Using generic coordinates.")
      );
    }
  }, []);

  const handleStartOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.name && user.gotra) {
      setAppState(AppState.DASHBOARD);
    }
  };

  const handleSelectRitual = (ritual: Ritual) => {
    setSelectedRitual(ritual);
    setAppState(AppState.POOJA_PLAYER);
  };

  const renderOnboarding = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-orange-100">
        <div className="spiritual-gradient p-8 text-center">
          <Sparkles className="w-12 h-12 text-white mx-auto mb-4" />
          <h1 className="text-3xl font-marcellus text-white">E-Pandit Pro</h1>
          <p className="text-orange-100 mt-2">Personalized Vedic Rituals at your home</p>
        </div>
        <form onSubmit={handleStartOnboarding} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-orange-800 mb-2 uppercase">Full Name (Yajamana)</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-orange-300" />
              <input 
                required
                type="text" 
                value={user.name}
                onChange={e => setUser({...user, name: e.target.value})}
                placeholder="e.g. Rahul Sharma" 
                className="w-full pl-10 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl focus:border-orange-500 focus:outline-none text-orange-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-orange-800 mb-2 uppercase">Gotra (Lineage)</label>
            <div className="relative">
              <Compass className="absolute left-3 top-3 w-5 h-5 text-orange-300" />
              <input 
                required
                type="text" 
                value={user.gotra}
                onChange={e => setUser({...user, gotra: e.target.value})}
                placeholder="e.g. Kashyap, Bhardwaj" 
                className="w-full pl-10 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl focus:border-orange-500 focus:outline-none text-orange-900"
              />
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl flex items-start gap-3">
            <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-orange-700">
              Your location and current time are used to generate the correct <strong>Sankalpam</strong> for your ritual.
            </p>
          </div>
          <button 
            type="submit" 
            className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition transform hover:scale-[1.02] shadow-lg"
          >
            Enter Spiritual Realm
          </button>
        </form>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="min-h-screen p-4 md:p-12">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-marcellus text-orange-900">Welcome, {user.name}</h1>
          <p className="text-orange-700">Ready for your ritual guidance?</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full shadow-md border border-orange-100">
          <div className="flex items-center gap-2">
            <Flower className="w-5 h-5 text-orange-400" />
            <span className="text-sm font-bold text-orange-800">{user.gotra} Gotra</span>
          </div>
          <div className="h-6 w-px bg-orange-200"></div>
          <button 
            onClick={() => setAppState(AppState.ONBOARDING)}
            className="text-sm text-orange-600 hover:text-orange-800 font-medium"
          >
            Edit Profile
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-marcellus text-orange-900 mb-8 border-l-4 border-orange-500 pl-4 uppercase tracking-wider">Choose Ritual</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {RITUALS.map(ritual => (
            <div 
              key={ritual.id} 
              onClick={() => handleSelectRitual(ritual)}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer border border-orange-100 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={ritual.image} 
                  alt={ritual.title} 
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-orange-500 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Ritual</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-marcellus text-orange-900 mb-2">{ritual.title}</h3>
                <p className="text-sm text-orange-700 line-clamp-2 mb-4">{ritual.description}</p>
                <div className="mt-auto pt-4 flex items-center justify-between text-orange-600 font-bold group-hover:text-orange-500">
                  <span>Start Pooja</span>
                  <Wind className="w-5 h-5 transition transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-20 pt-12 border-t border-orange-200 text-center text-orange-400 text-sm">
        <p>© 2025 E-Pandit Pro — Harmonizing Vedic Tradition with Intelligence</p>
      </footer>
    </div>
  );

  return (
    <div className="min-h-screen">
      {appState === AppState.ONBOARDING && renderOnboarding()}
      {appState === AppState.DASHBOARD && renderDashboard()}
      {appState === AppState.POOJA_PLAYER && selectedRitual && (
        <PoojaPlayer 
          ritual={selectedRitual} 
          user={user} 
          onClose={() => setAppState(AppState.DASHBOARD)} 
        />
      )}
    </div>
  );
};

export default App;
