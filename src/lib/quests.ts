
export interface Quest {
    id: string;
    type: 'daily' | 'weekly' | 'seasonal';
    text: string;
    description: string;
    xp: number;
    coinReward?: number;
    badgeReward?: string;
}

export const dailyQuests: Quest[] = [
    { id: 'daily-login-1', type: 'daily', text: "System Handshake", description: "Log in to the platform.", xp: 10 },
    { id: 'daily-msg-1', type: 'daily', text: "Signal Boost", description: "Send 10 chat messages.", xp: 20 },
    { id: 'daily-react-1', type: 'daily', text: "Echo Chamber", description: "React to 5 posts.", xp: 15 },
    { id: 'daily-note-1', type: 'daily', text: "Data Entry", description: "Create a new note.", xp: 30 },
];

export const weeklyQuests: Quest[] = [
    { id: 'weekly-msg-1', type: 'weekly', text: "Network Overload", description: "Send 200 messages.", xp: 200, coinReward: 50 },
    { id: 'weekly-friends-1', type: 'weekly', text: "Expand the Collective", description: "Make 3 friends.", xp: 150, badgeReward: 'socialite-2' },
    { id: 'weekly-files-1', type: 'weekly', text: "Data Trafficker", description: "Share 5 files.", xp: 100 },
    { id: 'weekly-call-1', type: 'weekly', text: "Voice of the Void", description: "Attend one call.", xp: 100 },
];

export const seasonalQuests: Quest[] = [
    { id: 'seasonal-tasks-1', type: 'seasonal', text: "Seasoned Operator", description: "Complete 30 daily tasks.", xp: 1000, coinReward: 500 },
    { id: 'seasonal-lvl-1', type: 'seasonal', text: "Power Surge", description: "Level up 10 times.", xp: 1000, badgeReward: 'overlord' },
    { id: 'seasonal-badges-1', type: 'seasonal', text: "Badge Collector", description: "Unlock 5 new badges.", xp: 500 },
];

    
