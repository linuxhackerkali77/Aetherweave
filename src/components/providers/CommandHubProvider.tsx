'use client';
import {
  CommandHubProvider as Provider,
  CommandHubContextType,
} from '@/hooks/use-command-hub';
import CommandHub from '@/components/ui/command-hub';
import { ReactNode, useState, useCallback, useMemo, useEffect } from 'react';
import { CommandHubAction } from '@/hooks/use-command-hub';
import { appEventEmitter } from '@/lib/event-emitter';
import InvitePeopleModal from '../modals/InvitePeopleModal';
import CreateOrJoinSpaceModal from '../modals/CreateOrJoinSpaceModal';
import SpaceSettingsModal from '../modals/SpaceSettingsModal';

type ModalType = 'invite-people' | 'create-join-space' | 'space-settings';

export function CommandHubProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [actions, setActions] = useState<CommandHubAction[]>([]);
  const [contextType, setContextType] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Modal State
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  const closeHub = useCallback(() => {
    if (isOpen) {
      appEventEmitter.emit('ui:sound', 'hub-close');
      setIsOpen(false);
      // Delay clearing to allow for exit animation
      setTimeout(() => {
        setActions([]);
        setContextType(null);
        setData(null);
        setTargetElement(null);
      }, 300);
    }
  }, [isOpen]);

  const getContextActions = useCallback((type: string, data?: any): CommandHubAction[] => {
    switch (type) {
      case 'text':
        return [
          { label: 'Copy', icon: 'Copy', onClick: () => navigator.clipboard.writeText(data?.text || '') },
          { label: 'Cut', icon: 'Scissors', onClick: () => console.log('Cut text') },
          { separator: true },
          { label: 'Select All', icon: 'MousePointer', onClick: () => document.execCommand('selectAll') }
        ];
      case 'image':
        return [
          { label: 'Copy Image', icon: 'Copy', onClick: () => console.log('Copy image') },
          { label: 'Download', icon: 'Download', onClick: () => data?.download?.() },
          { label: 'Share', icon: 'Share', onClick: () => console.log('Share image') },
          { separator: true },
          { label: 'Properties', icon: 'Info', onClick: () => console.log('Image properties') }
        ];
      case 'user':
        return [
          { label: 'View Profile', icon: 'User', onClick: async () => {
            setLoadingAction('View Profile');
            await new Promise(resolve => setTimeout(resolve, 500));
            data?.viewProfile?.();
            setLoadingAction(null);
          }},
          { label: 'Send Message', icon: 'MessageSquare', onClick: async () => {
            setLoadingAction('Send Message');
            await new Promise(resolve => setTimeout(resolve, 300));
            data?.sendMessage?.();
            setLoadingAction(null);
          }},
          { label: 'Voice Call', icon: 'Phone', onClick: async () => {
            setLoadingAction('Voice Call');
            await new Promise(resolve => setTimeout(resolve, 800));
            data?.voiceCall?.();
            setLoadingAction(null);
          }},
          { label: 'Video Call', icon: 'Video', onClick: async () => {
            setLoadingAction('Video Call');
            await new Promise(resolve => setTimeout(resolve, 800));
            data?.videoCall?.();
            setLoadingAction(null);
          }},
          { separator: true },
          { label: 'Add Friend', icon: 'UserPlus', onClick: async () => {
            setLoadingAction('Add Friend');
            await new Promise(resolve => setTimeout(resolve, 600));
            data?.addFriend?.();
            setLoadingAction(null);
          }, disabled: data?.isFriend },
          { label: 'Create Group', icon: 'Users', onClick: async () => {
            setLoadingAction('Create Group');
            await new Promise(resolve => setTimeout(resolve, 400));
            data?.createGroup?.();
            setLoadingAction(null);
          }},
          { separator: true },
          { label: 'Mute User', icon: 'VolumeX', onClick: async () => {
            setLoadingAction('Mute User');
            await new Promise(resolve => setTimeout(resolve, 300));
            data?.muteUser?.();
            setLoadingAction(null);
          }},
          { label: 'Pin Chat', icon: 'Pin', onClick: async () => {
            setLoadingAction('Pin Chat');
            await new Promise(resolve => setTimeout(resolve, 300));
            data?.pinChat?.();
            setLoadingAction(null);
          }},
          { separator: true },
          { label: 'Block User', icon: 'UserX', onClick: async () => {
            setLoadingAction('Block User');
            await new Promise(resolve => setTimeout(resolve, 500));
            data?.blockUser?.();
            setLoadingAction(null);
          }, isDestructive: true },
          { label: 'Report User', icon: 'Flag', onClick: async () => {
            setLoadingAction('Report User');
            await new Promise(resolve => setTimeout(resolve, 700));
            data?.reportUser?.();
            setLoadingAction(null);
          }, isDestructive: true }
        ];
      case 'message':
        return [
          { label: 'Reply', icon: 'Reply', onClick: () => data?.reply?.() },
          { label: 'Copy Text', icon: 'Copy', onClick: () => navigator.clipboard.writeText(data?.text || '') },
          { label: 'Edit', icon: 'Edit', onClick: () => data?.edit?.(), disabled: !data?.canEdit },
          { separator: true },
          { label: 'Delete', icon: 'Trash', onClick: () => data?.delete?.(), disabled: !data?.canDelete, isDestructive: true }
        ];
      case 'file':
        return [
          { label: 'Download', icon: 'Download', onClick: () => data?.download?.() },
          { label: 'Share', icon: 'Share', onClick: () => data?.share?.() },
          { label: 'Rename', icon: 'Edit', onClick: () => data?.rename?.() },
          { separator: true },
          { label: 'Delete', icon: 'Trash', onClick: () => data?.delete?.(), isDestructive: true },
          { label: 'Properties', icon: 'Info', onClick: () => data?.properties?.() }
        ];
      default:
        return [];
    }
  }, []);

  const openHub = useCallback(
    (
      event: React.MouseEvent,
      context: { type: string; actions?: CommandHubAction[]; data?: any }
    ) => {
      event.preventDefault();
      event.stopPropagation();
      appEventEmitter.emit('ui:sound', 'hub-open');

      setPosition({ x: event.clientX, y: event.clientY });
      const contextActions = context.actions || getContextActions(context.type, context.data);
      setActions(contextActions);
      setContextType(context.type);
      setData(context.data);
      setIsOpen(true);
    },
    [getContextActions]
  );

  const openModal = useCallback((modal: ModalType, data?: any) => {
    setActiveModal(modal);
    setModalData(data);
    closeHub(); // Close context menu when opening a modal
  }, [closeHub]);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalData(null);
  }, []);

  // Removed scroll listener to prevent menu from closing when scrolling

  const contextValue = useMemo<CommandHubContextType>(
    () => ({
      isOpen,
      position,
      actions,
      contextType,
      data,
      targetElement,
      openHub,
      closeHub,
      setTargetElement,
      openModal,
      closeModal,
      getContextActions,
      loadingAction,
    }),
    [
      isOpen,
      position,
      actions,
      contextType,
      data,
      targetElement,
      openHub,
      closeHub,
      openModal,
      closeModal,
      getContextActions,
      loadingAction,
    ]
  );

  return (
    <Provider value={contextValue}>
      {children}
      <CommandHub />
      {activeModal === 'invite-people' && (
        <InvitePeopleModal
          isOpen={true}
          onOpenChange={(open) => !open && closeModal()}
          space={modalData}
        />
      )}
       {activeModal === 'create-join-space' && (
        <CreateOrJoinSpaceModal
          isOpen={true}
          onOpenChange={(open) => !open && closeModal()}
        />
      )}
       {activeModal === 'space-settings' && (
        <SpaceSettingsModal
          isOpen={true}
          onOpenChange={(open) => !open && closeModal()}
          space={modalData}
        />
      )}
    </Provider>
  );
}
