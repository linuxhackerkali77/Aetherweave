
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { FilePlus2, Search, Pin, Tag, Folder, Bold, Italic, Underline, List, PlusCircle, Trash2, Check, Loader2, BrainCircuit, Bot } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNotes, Note } from '@/hooks/use-notes';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-user';
import { useCommandHub } from '@/hooks/use-command-hub';
import { summarizeNotes } from '@/ai/flows/summarize-notes';
import { generateTasksFromNotes } from '@/ai/flows/generate-tasks-from-notes';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


const categories = ['All', 'Work', 'Personal', 'Projects', 'Ideas'];

export default function NotesPage() {
  const { notes, loading, addNote, updateNote, deleteNote } = useNotes();
  const { toast } = useToast();
  const { incrementStat } = useUser();
  const { openHub } = useCommandHub();
  
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAiActionLoading, setIsAiActionLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteIdsToDelete, setNoteIdsToDelete] = useState<string[]>([]);


  // When notes data changes, update the selected note if it's still in the list
  useEffect(() => {
    if (selectedNote) {
      const updatedSelectedNote = notes.find(note => note.id === selectedNote.id);
      if (!updatedSelectedNote) {
        // The previously selected note was deleted
        setSelectedNote(notes.length > 0 ? notes[0] : null);
        setSelectedNoteIds(new Set());
      } else {
        setSelectedNote(updatedSelectedNote);
      }
    } else if (notes.length > 0) {
      setSelectedNote(notes[0]);
    } else {
      setSelectedNote(null);
    }
  }, [notes]);


  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => activeCategory === 'All' || note.category === activeCategory)
      .filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()) || note.content.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [notes, activeCategory, searchTerm]);

  const handleAddNewNote = async () => {
    setIsCreating(true);
    try {
      const newNoteData = {
        title: 'Untitled Note',
        content: '',
        category: 'Personal',
        tags: [],
        pinned: false,
      };
      const newNoteRef = await addNote(newNoteData);
      await incrementStat('notesCreated', 1);

      toast({ title: 'Note created', description: 'A new note has been added to your collection.'});
      // The useEffect will handle selecting the new note once it appears in the `notes` list.
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not create note.'});
    } finally {
        setIsCreating(false);
    }
  };

  const handleUpdateNote = async (field: keyof Note, value: any) => {
    if (!selectedNote) return;
    
    // Optimistic update
    const updatedNote = { ...selectedNote, [field]: value };
    setSelectedNote(updatedNote);
    
    setIsSaving(true);
    try {
      await updateNote(selectedNote.id, { [field]: value });
      setTimeout(() => setIsSaving(false), 1000); // Show checkmark for a bit
    } catch (error) {
      // Revert on error
      setSelectedNote(selectedNote);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save note changes.'});
      setIsSaving(false);
    }
  };

 const handleDeleteRequest = (ids: string[]) => {
    setNoteIdsToDelete(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (noteIdsToDelete.length === 0) return;
    
    try {
        await Promise.all(noteIdsToDelete.map(id => deleteNote(id)));
        toast({ title: `${noteIdsToDelete.length} Note${noteIdsToDelete.length > 1 ? 's' : ''} deleted` });
        setSelectedNoteIds(new Set());
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete notes.' });
    } finally {
        setIsDeleteDialogOpen(false);
        setNoteIdsToDelete([]);
    }
  };


  const handleNoteClick = (note: Note, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
        setSelectedNoteIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(note.id)) {
                newSet.delete(note.id);
            } else {
                newSet.add(note.id);
            }
            return newSet;
        });
    } else {
        setSelectedNote(note);
        setSelectedNoteIds(new Set([note.id]));
    }
  };
  
  const handleAiSummarize = async () => {
    const selectedNotes = notes.filter(n => selectedNoteIds.has(n.id));
    if (selectedNotes.length === 0) return;

    setIsAiActionLoading(true);
    const combinedContent = selectedNotes.map(n => `Title: ${n.title}\nContent: ${n.content}`).join('\n\n---\n\n');
    
    try {
        const result = await summarizeNotes({ notes: combinedContent });
        toast({
            duration: 10000,
            title: 'AI Summary Complete',
            description: (
                <div className="flex flex-col gap-2">
                    <p className="font-bold flex items-center gap-2"><Bot size={16}/> Here is the summary of your selected notes:</p>
                    <p className="text-sm">{result.summary}</p>
                </div>
            )
        });
    } catch(e) {
        toast({ variant: 'destructive', title: 'AI Error', description: 'Could not summarize notes.'});
    } finally {
        setIsAiActionLoading(false);
    }
  };
  
  const handleAiExtractTasks = async () => {
    const selectedNotes = notes.filter(n => selectedNoteIds.has(n.id));
    if (selectedNotes.length === 0) return;
    setIsAiActionLoading(true);

    const combinedContent = selectedNotes.map(n => `Title: ${n.title}\nContent: ${n.content}`).join('\n\n---\n\n');

    try {
        const result = await generateTasksFromNotes({ notes: combinedContent });
        toast({
            duration: 10000,
            title: 'AI Task Extraction Complete',
            description: (
                 <div className="flex flex-col gap-2">
                    <p className="font-bold flex items-center gap-2"><Bot size={16}/> Suggested tasks from your notes:</p>
                    <ul className="list-disc pl-4">
                        {result.tasks.map((task, i) => <li key={i}>{task}</li>)}
                    </ul>
                </div>
            )
        })
    } catch (e) {
        toast({ variant: 'destructive', title: 'AI Error', description: 'Could not extract tasks.'});
    } finally {
        setIsAiActionLoading(false);
    }
  };

  const handleNoteContextMenu = (e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    e.stopPropagation();

    const isMultiSelect = selectedNoteIds.size > 1 && selectedNoteIds.has(note.id);
    
    let actions = [];

    if (isMultiSelect) {
        actions = [
             { label: `Summarize ${selectedNoteIds.size} notes`, icon: 'BrainCircuit', onClick: handleAiSummarize, disabled: isAiActionLoading },
             { label: `Extract tasks from ${selectedNoteIds.size} notes`, icon: 'Bot', onClick: handleAiExtractTasks, disabled: isAiActionLoading },
             { label: `Delete ${selectedNoteIds.size} notes`, icon: 'Trash2', onClick: () => handleDeleteRequest(Array.from(selectedNoteIds)), isDestructive: true },
        ];
    } else {
        actions = [
            { label: note.pinned ? 'Unpin Note' : 'Pin Note', icon: 'Pin', onClick: () => handleUpdateNote('pinned', !note.pinned) },
            { label: 'Delete Note', icon: 'Trash2', onClick: () => handleDeleteRequest([note.id]), isDestructive: true },
        ];
    }

    openHub(e, {
      type: isMultiSelect ? 'note-multi-select' : 'note-item',
      data: note,
      actions,
    });
  };


  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 h-[calc(100vh-10rem)]">
        {/* Sidebar with Categories and Notes List */}
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>My Notes</CardTitle>
            <Button size="icon" variant="ghost" onClick={handleAddNewNote} className="h-8 w-8" disabled={isCreating}>
              {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5 text-primary" />}
            </Button>
          </CardHeader>
          <div className="px-4 pb-2">
              <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                      placeholder="Search all notes..." 
                      className="pl-8 bg-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>
          <Accordion type="single" collapsible defaultValue="item-1" className="px-4">
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className="py-2 text-sm font-medium text-muted-foreground hover:no-underline">
                  <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      <span>Categories</span>
                  </div>
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                  <div className="flex flex-col gap-1">
                      {categories.map(category => (
                          <Button
                              key={category}
                              variant={activeCategory === category ? 'secondary' : 'ghost'}
                              className="w-full justify-start"
                              onClick={() => setActiveCategory(category)}
                          >
                              {category}
                          </Button>
                      ))}
                  </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <ScrollArea className="flex-1">
            <div className="p-4 pt-2 space-y-2">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : filteredNotes.map((note) => (
              <div 
                key={note.id}
                className={cn(
                  "p-3 rounded-md border-l-4 cursor-pointer transition-all",
                  selectedNoteIds.has(note.id) ? 'bg-primary/20 neon-border-primary' : 'border-transparent hover:bg-muted/50',
                )}
                onClick={(e) => handleNoteClick(note, e)}
                onContextMenu={(e) => handleNoteContextMenu(e, note)}
                data-command-hub-trigger
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold truncate pr-2">{note.title}</h4>
                  {note.pinned && <Pin className="w-4 h-4 text-primary shrink-0" />}
                </div>
                <p className="text-sm text-muted-foreground truncate">{note.content || "No content"}</p>
              </div>
            ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Note Editor */}
        <div className="md:col-span-1 flex flex-col gap-4">
          {selectedNote ? (
              <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-4">
                      <Input 
                          key={selectedNote.id} // Re-renders the input on note change
                          defaultValue={selectedNote.title}
                          onBlur={(e) => handleUpdateNote('title', e.target.value)}
                          className="text-2xl font-headline border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                          placeholder="Note Title"
                      />
                      <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateNote('pinned', !selectedNote.pinned)}>
                              <Pin className={cn("h-4 w-4", selectedNote.pinned && "text-primary fill-primary")} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteRequest([selectedNote.id])}>
                              <Trash2 className="h-4 w-4 text-destructive/80 hover:text-destructive" />
                          </Button>
                          <Button size="sm" className="cyber-button w-[90px]" onClick={() => handleUpdateNote('content', selectedNote.content)}>
                              {isSaving ? <Check className="h-4 w-4" /> : 'Save'}
                          </Button>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      {selectedNote.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                      {/* Add tag input here later */}
                  </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4 pt-2">
                  <div className="flex items-center gap-1 border rounded-md p-1 bg-input/50">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Bold className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Italic className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Underline className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><List className="w-4 h-4" /></Button>
                  </div>
                  <Textarea
                  key={selectedNote.id} // Re-renders the textarea on note change
                  defaultValue={selectedNote.content}
                  onBlur={(e) => handleUpdateNote('content', e.target.value)}
                  className="flex-1 resize-none bg-input/50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                  placeholder="Type your notes here..."
                  />
              </CardContent>
              </Card>
          ) : (
               <div className="flex-1 flex items-center justify-center glass-card">
                  <div className="text-center">
                      <p className="text-xl font-headline text-muted-foreground">Select a note to view</p>
                      <p className="text-sm text-muted-foreground/80 mt-2">or create a new one to get started.</p>
                      <Button onClick={handleAddNewNote} className="mt-4" disabled={isCreating}>
                         {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Creating...</> : <><PlusCircle className="mr-2 h-4 w-4" />Create New Note</>}
                      </Button>
                  </div>
              </div>
          )}
        </div>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {noteIdsToDelete.length > 1 ? `${noteIdsToDelete.length} notes` : 'this note'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
