
import * as Lucide from 'lucide-react';

export type TutorialContent = {
  [pageId: string]: {
    title: string;
    description: string;
    icon: keyof typeof Lucide;
  }[];
};

export const tutorialContent: TutorialContent = {
  'auth-check': [
    {
      title: 'Verifying Credentials',
      description: 'Checking your operator ID against the Aetherweave mainframe.',
      icon: 'ShieldCheck',
    },
  ],
  dashboard: [
    {
      title: 'Navigation Hub',
      description: 'Click the central orb or the grid icon to access all system modules.',
      icon: 'Orbit',
    },
    {
      title: 'Weather Module',
      description: 'Real-time atmospheric data from your physical location.',
      icon: 'CloudSun',
    },
    {
      title: 'Session Tracker',
      description: 'Monitors your active connection time to the Aetherweave network.',
      icon: 'Timer',
    },
  ],
  chat: [
    {
      title: 'Contact List',
      description: 'All your connections are listed here. Click one to start a conversation.',
      icon: 'Users',
    },
    {
      title: 'Aether Assistant',
      description: 'Your personal AI. Ask it anything, from coding help to world history.',
      icon: 'Bot',
    },
    {
      title: 'Call Functions',
      description: 'Initiate secure, end-to-end encrypted voice or video calls.',
      icon: 'Phone',
    },
  ],
  news: [
    {
      title: 'Category Tabs',
      description: 'Filter the global news feed by category.',
      icon: 'Filter',
    },
    {
      title: 'Infinite Scroll',
      description: 'Scroll down to seamlessly load more articles.',
      icon: 'ArrowDown',
    },
  ],
};
