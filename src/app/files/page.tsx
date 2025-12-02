
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive, Folder, File as FileIcon, ImageIcon, Video, FileArchive, Search, PlusCircle, FolderPlus, UploadCloud, GripVertical, Trash2, Download, ChevronsRight, Edit, Copy, MoreVertical, Eye, Share2, Replace, PlusSquare, ShieldCheck } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStorage, type StoredFile } from '@/hooks/use-storage';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-user';
import { ref } from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import { useFirebaseApp } from '@/firebase/provider';
import { useCommandHub } from '@/hooks/use-command-hub';

const getFileIcon = (file: StoredFile) => {
    if (file.isFolder) {
        return <Folder className="w-10 h-10 text-primary" />;
    }
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension!)) {
        return <ImageIcon className="w-10 h-10 text-secondary" />;
    }
    if (['mp4', 'mov', 'avi', 'mkv'].includes(extension!)) {
        return <Video className="w-10 h-10 text-accent" />;
    }
    if (['zip', 'rar', '7z', 'tar'].includes(extension!)) {
        return <FileArchive className="w-10 h-10 text-yellow-500" />;
    }
    return <FileIcon className="w-10 h-10 text-muted-foreground" />;
};


export default function FilesPage() {
    const [currentPath, setCurrentPath] = useState('');
    const { user, incrementStat } = useUser();
    const app = useFirebaseApp();
    const { files, loading, uploadFile, deleteFile, downloadFileUrl, createFolder, fetchFiles } = useStorage();
    const { toast } = useToast();
    const [dragging, setDragging] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { openHub } = useCommandHub();

    const storageRef = useMemo(() => {
        if (!user) return null;
        const storage = getStorage(app);
        const finalPath = `${user.uid}/${currentPath}`;
        return ref(storage, finalPath);
      }, [app, user, currentPath]);

    useEffect(() => {
        if (storageRef) {
            fetchFiles(storageRef);
        }
    }, [storageRef, fetchFiles]);


    const filteredFiles = useMemo(() => {
        return files.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [files, searchTerm]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;
        handleUpload(fileList[0]);
    };

    const handleUpload = async (file: File) => {
        if (!user) return;
        const fullPath = `${user.uid}/${currentPath ? currentPath + '/' : ''}${file.name}`;
        try {
            await uploadFile(file, fullPath);
            await incrementStat('filesUploaded', 1);
            toast({
                title: 'File Uploaded',
                description: `${file.name} has been successfully uploaded.`
            });
            if (storageRef) fetchFiles(storageRef);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: error.message || 'Could not upload the file.'
            });
        }
    };
    
    const handleCreateFolder = async () => {
        const folderName = prompt('Enter folder name:');
        if (!folderName || !user) return;
        
        try {
            const path = currentPath ? `${currentPath}/${folderName}` : folderName;
            await createFolder(folderName, currentPath);
            toast({
                title: 'Folder Created',
                description: `Folder "${folderName}" has been created.`
            });
             if (storageRef) fetchFiles(storageRef);
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Creation Failed',
                description: error.message || 'Could not create the folder.'
            });
        }
    };

    const handleDelete = async (file: StoredFile) => {
        if (!confirm(`Are you sure you want to delete "${file.name}"? This cannot be undone.`)) return;
        try {
            await deleteFile(file.fullPath);
            toast({
                title: 'Item Deleted',
                description: `${file.name} has been permanently deleted.`
            });
            if (storageRef) fetchFiles(storageRef);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: error.message || 'Could not delete the item.'
            });
        }
    };
    
    const handleFileContextMenu = (e: React.MouseEvent, file: StoredFile) => {
        e.preventDefault();
        e.stopPropagation();

        const folderActions = [
            { label: 'Open Folder', icon: 'FolderOpen' as const, onClick: () => setCurrentPath(file.fullPath.substring(user!.uid.length + 1)) },
            { label: 'Rename', icon: 'Edit' as const, onClick: () => alert('Rename not implemented') },
            { label: 'Copy Path', icon: 'Copy' as const, onClick: () => { navigator.clipboard.writeText(file.fullPath); toast({title: 'Path copied!'}) } },
            { label: 'Delete Folder', icon: 'Trash2' as const, onClick: () => handleDelete(file), isDestructive: true },
        ];

        const fileActions = [
            { label: 'Preview', icon: 'Eye' as const, onClick: () => alert(`Previewing ${file.name}`)},
            { label: 'Download', icon: 'Download' as const, onClick: () => downloadFileUrl(file.fullPath, file.name) },
            { label: 'Share', icon: 'Share2' as const, onClick: () => alert(`Sharing ${file.name}`)},
            { label: 'Add to collection', icon: 'PlusSquare' as const, onClick: () => alert(`Adding ${file.name} to collection`) },
            { label: 'Virus Scan', icon: 'ShieldCheck' as const, onClick: () => toast({title: 'Scan Complete', description: `${file.name} is secure.`})},
            { label: 'Convert', icon: 'Replace' as const, onClick: () => {}, disabled: true},
            { label: 'Compress', icon: 'FileArchive' as const, onClick: () => {}, disabled: true},
            { label: 'Delete', icon: 'Trash2' as const, onClick: () => handleDelete(file), isDestructive: true },
        ];

        openHub(e, {
            type: file.isFolder ? 'file-folder' : 'file-item',
            data: file,
            actions: file.isFolder ? folderActions : fileActions,
        });
    };
    
    const handleBreadcrumbClick = (pathSegment: string, index: number) => {
        const pathSegments = currentPath.split('/').filter(Boolean);
        const newPath = pathSegments.slice(0, index).join('/');
        setCurrentPath(newPath);
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(true);
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            handleUpload(droppedFiles[0]);
        }
    };
    
    const breadcrumbs = ['root', ...currentPath.split('/').filter(Boolean)];


  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 h-[calc(100vh-10rem)]">
        {/* Sidebar */}
        <Card className="md:col-span-1 flex flex-col">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><HardDrive className="text-primary"/> My Drive</CardTitle>
              <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCreateFolder}><FolderPlus className="w-5 h-5 text-primary" /></Button>
                    </TooltipTrigger>
                    <TooltipContent><p>New Folder</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <div className="px-4 pb-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search drive..." 
                        className="pl-8 bg-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <Accordion type="multiple" defaultValue={['personal-files']} className="p-4">
                    <AccordionItem value="personal-files">
                        <AccordionTrigger className="hover:no-underline text-base">Personal Files</AccordionTrigger>
                        <AccordionContent>
                           <p className="text-muted-foreground text-sm p-4 text-center">Folder functionality coming soon.</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="shared-drives">
                        <AccordionTrigger className="hover:no-underline text-base">Shared Drives</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-muted-foreground text-sm p-4 text-center">No shared drives connected.</p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </ScrollArea>
            <div className="p-4 mt-auto border-t">
                 <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                <Button className="w-full cyber-button" onClick={() => fileInputRef.current?.click()}><UploadCloud className="mr-2"/> Upload File</Button>
            </div>
        </Card>

        {/* File Grid */}
        <div 
            className={cn("md:col-span-1 flex flex-col transition-all", dragging && "neon-border-primary")}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                  <div className="flex items-center text-sm text-muted-foreground">
                      {breadcrumbs.map((segment, index) => (
                          <React.Fragment key={index}>
                            <button onClick={() => handleBreadcrumbClick(segment, index)} className="hover:text-primary transition-colors">
                                  {segment}
                              </button>
                              {index < breadcrumbs.length - 1 && <ChevronsRight className="h-4 w-4 mx-1" />}
                          </React.Fragment>
                      ))}
                  </div>
              </CardHeader>
              <CardContent className="flex-1">
                  <ScrollArea className="h-full">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-1">
                          {loading ? (
                              Array.from({ length: 10 }).map((_, i) => (
                                  <div key={i}>
                                      <Skeleton className="aspect-square w-full" />
                                      <Skeleton className="h-4 w-3/4 mt-2" />
                                      <Skeleton className="h-3 w-1/2 mt-1" />
                                  </div>
                              ))
                          ) : filteredFiles.map(file => (
                              <div 
                                  key={file.fullPath} 
                                  className="relative group cursor-pointer"
                                  onClick={(e) => {
                                      e.preventDefault();
                                      if (file.isFolder) {
                                        setCurrentPath(file.fullPath.substring(user!.uid.length + 1));
                                      } else {
                                        downloadFileUrl(file.fullPath, file.name);
                                      }
                                  }}
                                  onContextMenu={(e) => handleFileContextMenu(e, file)}
                                  data-command-hub-trigger
                              >
                                  <Card className="aspect-square flex flex-col items-center justify-center p-4 bg-muted/30 hover:bg-muted/60 hover:neon-border-primary transition-all">
                                      {getFileIcon(file)}
                                  </Card>
                                  <div className="mt-2 text-center">
                                      <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                                      {!file.isFolder && <p className="text-xs text-muted-foreground">{file.size}</p>}
                                  </div>
                                  <div 
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => { e.stopPropagation(); handleFileContextMenu(e, file); }}
                                >
                                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                </div>
                              </div>
                          ))}
                      </div>
                  </ScrollArea>
              </CardContent>
            </Card>
             {dragging && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 pointer-events-none rounded-lg">
                        <div className="text-center p-8 border-2 border-dashed border-primary rounded-lg">
                           <UploadCloud className="w-16 h-16 text-primary mx-auto animate-pulse" />
                           <p className="mt-4 text-xl font-headline text-glow">Drop to upload</p>
                        </div>
                    </div>
                )}
        </div>
    </div>
  );
}
