
import { Ritual, PanditVoice } from './types';

export const PANDIT_VOICES: PanditVoice[] = [
  { id: 'Kore', name: 'Pandit Shastri', description: 'Deep & Traditional' },
  { id: 'Zephyr', name: 'Pandit Varma', description: 'Clear & Modern' },
  { id: 'Charon', name: 'Pandit Krishna', description: 'Calm & Soothing' },
  { id: 'Puck', name: 'Pandit Anand', description: 'Energetic & Bright' },
  { id: 'Fenrir', name: 'Pandit Rishi', description: 'Authoritative & Grave' },
];

export const RITUALS: Ritual[] = [
  {
    id: 'ganesh-pooja',
    title: 'Ganesh Pooja',
    description: 'The ritual to invoke the Lord of Wisdom and Obstacle-Remover.',
    image: 'https://picsum.photos/seed/ganesh/800/600',
    steps: []
  },
  {
    id: 'lakshmi-pooja',
    title: 'Lakshmi Pooja',
    description: 'Invocation of Goddess Lakshmi for wealth, prosperity, and light.',
    image: 'https://picsum.photos/seed/lakshmi/800/600',
    steps: []
  },
  {
    id: 'satyanarayan',
    title: 'Satyanarayan Katha',
    description: 'A sacred narrative and ritual dedicated to Lord Vishnu as Truth.',
    image: 'https://picsum.photos/seed/vishnu/800/600',
    steps: []
  },
  {
    id: 'shiv-pooja',
    title: 'Shiva Pooja',
    description: 'Ritualistic worship of Lord Shiva involving Abhishekam and Bilva leaves.',
    image: 'https://picsum.photos/seed/shiva/800/600',
    steps: []
  }
];
