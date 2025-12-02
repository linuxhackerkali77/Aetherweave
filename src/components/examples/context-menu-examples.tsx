'use client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContextMenuExamples() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Context Menu Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Text with context menu */}
          <div>
            <h3 className="font-semibold mb-2">Text Selection</h3>
            <p 
              className="p-2 border rounded"
              data-context-type="text"
            >
              Right-click this text or select some text and right-click to see text options.
            </p>
          </div>

          {/* Image with context menu */}
          <div>
            <h3 className="font-semibold mb-2">Image</h3>
            <img 
              src="https://via.placeholder.com/200x150" 
              alt="Example"
              className="border rounded cursor-pointer"
              data-context-type="image"
              data-context-data={JSON.stringify({
                download: () => console.log('Download image')
              })}
            />
          </div>

          {/* Link with context menu */}
          <div>
            <h3 className="font-semibold mb-2">Link</h3>
            <a 
              href="https://example.com"
              className="text-primary underline"
              data-context-type="link"
              data-context-data={JSON.stringify({
                url: 'https://example.com'
              })}
            >
              Right-click this link
            </a>
          </div>

          {/* User avatar with context menu */}
          <div>
            <h3 className="font-semibold mb-2">User Avatar</h3>
            <Avatar 
              className="cursor-pointer"
              data-context-type="user"
              data-context-data={JSON.stringify({
                viewProfile: () => console.log('View profile'),
                sendMessage: () => console.log('Send message'),
                addFriend: () => console.log('Add friend'),
                blockUser: () => console.log('Block user'),
                isFriend: false
              })}
            >
              <AvatarImage src="https://via.placeholder.com/40" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>

          {/* Message with context menu */}
          <div>
            <h3 className="font-semibold mb-2">Message</h3>
            <div 
              className="p-3 bg-muted rounded cursor-pointer"
              data-context-type="message"
              data-context-data={JSON.stringify({
                text: 'This is a sample message',
                reply: () => console.log('Reply to message'),
                edit: () => console.log('Edit message'),
                delete: () => console.log('Delete message'),
                canEdit: true,
                canDelete: true
              })}
            >
              This is a sample message. Right-click for options.
            </div>
          </div>

          {/* File with context menu */}
          <div>
            <h3 className="font-semibold mb-2">File</h3>
            <div 
              className="p-3 border rounded cursor-pointer flex items-center gap-2"
              data-context-type="file"
              data-context-data={JSON.stringify({
                download: () => console.log('Download file'),
                share: () => console.log('Share file'),
                rename: () => console.log('Rename file'),
                delete: () => console.log('Delete file'),
                properties: () => console.log('File properties')
              })}
            >
              📄 document.pdf
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}