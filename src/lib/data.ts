import { PlaceHolderImages } from "./placeholder-images";

export const mockTasks = [
    { id: 1, title: 'Infiltrate Arasaka Tower', status: 'in-progress', priority: 'High', dueDate: 'Tomorrow' },
    { id: 2, title: 'Debug cyberdeck firmware', status: 'backlog', priority: 'Medium', dueDate: 'Next Week' },
    { id: 3, title: 'Meet with Netrunner informant', status: 'done', priority: 'High', dueDate: 'Yesterday' },
    { id: 4, title: 'Upgrade optical implants', status: 'backlog', priority: 'Low', dueDate: 'In 2 weeks' },
  ];
  
  export const mockNotes = [
    { id: 1, title: 'Night City Market Passcodes', content: 'Mainframe access: 7-3-4-5-1. Black market vendor: "Chrome Tiger". Mention my name.' },
    { id: 2, title: 'Thoughts on AI sentience', content: 'Are they just complex algorithms, or is there a ghost in the machine? The Turing test seems outdated...' },
    { id: 3, title: 'Cyberware Wishlist', content: 'Sandevistan Mk.5, Projectile Launch System, Gorilla Arms.' },
  ];
  
  const users = {
    '1': { name: 'Jaina', avatar: PlaceHolderImages.find(p => p.id === 'user-avatar-2')?.imageUrl ?? '' },
    '2': { name: 'Kael', avatar: PlaceHolderImages.find(p => p.id === 'user-avatar-3')?.imageUrl ?? '' },
    '3': { name: 'Sylvanas', avatar: PlaceHolderImages.find(p => p.id === 'user-avatar-4')?.imageUrl ?? '' },
  }
  
  export const mockActivity = [
    { id: 1, user: users['1'], action: 'sent a message in #general', type: 'chat', timestamp: '5 minutes ago' },
    { id: 2, user: users['2'], action: 'completed task "Decrypt Militech datashard"', type: 'task', timestamp: '1 hour ago' },
    { id: 3, user: users['3'], action: 'created a new note "Safehouse Locations"', type: 'note', timestamp: '3 hours ago' },
    { id: 4, user: users['1'], action: 'added you as a contact', type: 'contact', timestamp: '1 day ago' },
  ];
  
  export const mockKanbanData = {
    columns: [
      {
        id: 'backlog',
        title: 'Backlog',
        tasks: [
          { id: 'task-2', content: 'Debug cyberdeck firmware', priority: 'Medium' },
          { id: 'task-4', content: 'Upgrade optical implants', priority: 'Low' },
          { id: 'task-5', content: 'Source black-market ICE breaker', priority: 'High' },
        ],
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        tasks: [
          { id: 'task-1', content: 'Infiltrate Arasaka Tower', priority: 'High' },
        ],
      },
      {
        id: 'done',
        title: 'Done',
        tasks: [
          { id: 'task-3', content: 'Meet with Netrunner informant', priority: 'High' },
        ],
      },
    ],
  };

export const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '😠', '🔥', '✅', '🎉'];
  
