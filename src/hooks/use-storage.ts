
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  uploadBytes,
  listAll,
  getDownloadURL as getFbDownloadURL,
  deleteObject,
  getMetadata,
  uploadString,
  type StorageReference,
  UploadTask,
} from 'firebase/storage';
import { useFirebaseApp } from '@/firebase/provider';
import { useUser } from '@/hooks/use-user';
import { useToast } from './use-toast';
import { useNotifications } from './use-notifications';

export interface StoredFile {
  name: string;
  fullPath: string;
  isFolder: boolean;
  size: string;
  type: string;
  createdAt: string;
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export function useStorage() {
  const app = useFirebaseApp();
  const { user } = useUser();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const storage = useMemo(() => getStorage(app), [app]);
  
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async (currentRef: StorageReference) => {
    setLoading(true);
    try {
        const result = await listAll(currentRef);
        
        const folders = result.prefixes.map((folderRef) => ({
            name: folderRef.name,
            fullPath: folderRef.fullPath,
            isFolder: true,
            size: '',
            type: 'folder',
            createdAt: '', // Folder metadata is not directly available
        }));

        const filesData = await Promise.all(
            result.items.map(async (itemRef) => {
                const metadata = await getMetadata(itemRef);
                return {
                    name: metadata.name,
                    fullPath: metadata.fullPath,
                    isFolder: false,
                    size: formatBytes(metadata.size),
                    type: metadata.contentType || 'unknown',
                    createdAt: metadata.timeCreated,
                };
            })
        );
        
        setFiles([...folders, ...filesData]);
    } catch (error: any) {
        console.error("Error listing files:", error);
        toast({
            variant: 'destructive',
            title: 'Error fetching files',
            description: error.message,
        });
    } finally {
        setLoading(false);
    }
  }, [toast]);


  const uploadFile = async (file: File, fullPath: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated.');
    
    const fileRef = ref(storage, fullPath);
    const uploadResult = await uploadBytes(fileRef, file);
    await addNotification({
      type: 'file_upload',
      title: 'File Uploaded',
      description: `Successfully uploaded ${file.name}.`,
      link: '/files'
    });
    // Return the download URL after upload
    return await getFbDownloadURL(uploadResult.ref);
  };
  
  const uploadChatMedia = (file: File, path: string): UploadTask => {
    if (!user) throw new Error('User not authenticated.');
    const mediaRef = ref(storage, path);
    return uploadBytesResumable(mediaRef, file);
  };
  
  const createFolder = async (folderName: string, currentPath: string) => {
      const path = currentPath ? `${currentPath}/${folderName}` : folderName;
      const folderRef = ref(storage, `${user?.uid}/${path}/.placeholder`);
      await uploadString(folderRef, '');
      // This function no longer re-fetches, the component should do it.
  }

  const deleteFile = async (fullPath: string) => {
    const fileRef = ref(storage, fullPath);
    await deleteObject(fileRef);
    // This function no longer re-fetches, the component should do it.
  };


  const downloadFileUrl = async (fullPath: string, fileName: string) => {
      try {
        const url = await getFbDownloadURL(ref(storage, fullPath));

        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = fileName; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

      } catch (error: any) {
          console.error("Error getting download URL: ", error);
           toast({
                variant: 'destructive',
                title: 'Download Failed',
                description: "Could not get file URL. Check storage rules and CORS configuration."
            });
      }
  };


  return { files, loading, uploadFile, deleteFile, downloadFileUrl, createFolder, fetchFiles, uploadChatMedia };
}
