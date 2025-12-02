'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Video } from 'lucide-react';
import { useEnhancedCalls } from '@/hooks/use-enhanced-calls';
import { useConnections } from '@/hooks/use-connections';

export default function CallsTestPage() {
  const { startCall, callStatus } = useEnhancedCalls();
  const { users } = useConnections();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Test Calling System</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Call Status: {callStatus}</h2>
        <p className="text-muted-foreground">
          Select a user below to start a call. The system will show different panels based on call state.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                {user.displayName?.[0] || '?'}
              </div>
              <div>
                <h3 className="font-semibold">{user.displayName || 'Unknown'}</h3>
                <p className="text-sm text-muted-foreground">{user.status || 'Offline'}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => startCall(user.id, user.displayName || 'Unknown', 'voice', user.photoURL)}
                className="flex-1"
                variant="outline"
              >
                <Phone className="w-4 h-4 mr-2" />
                Voice
              </Button>
              <Button
                onClick={() => startCall(user.id, user.displayName || 'Unknown', 'video', user.photoURL)}
                className="flex-1"
              >
                <Video className="w-4 h-4 mr-2" />
                Video
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No users available. Add some connections first.</p>
        </Card>
      )}
    </div>
  );
}
