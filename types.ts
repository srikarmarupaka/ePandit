
export interface UserProfile {
  name: string;
  gotra: string;
  location?: {
    lat: number;
    lng: number;
    city?: string;
  };
}

export interface Ritual {
  id: string;
  title: string;
  description: string;
  steps: RitualStep[];
  image: string;
}

export interface RitualStep {
  id: number;
  title: string;
  instruction: string;
  mantra: string;
  isSankalpam?: boolean;
}

export interface PanditVoice {
  id: string;
  name: string;
  description: string;
}

export enum AppState {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  POOJA_PLAYER = 'POOJA_PLAYER'
}
