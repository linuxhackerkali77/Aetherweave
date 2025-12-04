import { PublicUser } from '@/hooks/use-connections';

export const getDerivedStatus = (profile: PublicUser | null): {label: string, color: string, isOnline: boolean} => {
    if (!profile) return {label: 'Offline', color: 'bg-gray-500', isOnline: false};
    
    if (profile.lastSeen) {
        try {
            const lastSeenDate = profile.lastSeen.toDate ? profile.lastSeen.toDate() : new Date(profile.lastSeen as any);
            const minutesSinceSeen = (new Date().getTime() - lastSeenDate.getTime()) / (1000 * 60);

            if (minutesSinceSeen < 2) {
                return {label: 'Online', color: 'bg-green-500', isOnline: true};
            } else if (minutesSinceSeen < 10) {
                return {label: 'Away', color: 'bg-yellow-500', isOnline: false};
            }
        } catch (e) {
            console.error('Error parsing lastSeen:', e);
        }
    }
    
    return {label: 'Offline', color: 'bg-gray-500', isOnline: false};
}