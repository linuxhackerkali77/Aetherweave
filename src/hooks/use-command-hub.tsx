'use client';
import { createContext, useContext, ReactNode, ProviderProps } from 'react';
import * as Lucide from 'lucide-react';

export type CommandHubAction = {
  label: string;
  icon: keyof typeof Lucide;
  onClick: (data?: any) => void;
  isDestructive?: boolean;
  disabled?: boolean;
  separator?: boolean;
};

export type ModalType = 'invite-people' | 'create-join-space' | 'space-settings';

export interface CommandHubContextType {
  isOpen: boolean;
  position: { x: number; y: number };
  actions: CommandHubAction[];
  contextType: string | null;
  data?: any;
  targetElement?: HTMLElement | null;
  openHub: (
    event: React.MouseEvent,
    context: { type: string; actions?: CommandHubAction[]; data?: any }
  ) => void;
  getContextActions: (type: string, data?: any) => CommandHubAction[];
  closeHub: () => void;
  setTargetElement: (element: HTMLElement | null) => void;
  openModal: (modal: ModalType, data?: any) => void;
  closeModal: () => void;
  loadingAction?: string | null;
}

const CommandHubContext = createContext<CommandHubContextType | undefined>(
  undefined
);

export const useCommandHub = () => {
  const context = useContext(CommandHubContext);
  if (!context) {
    throw new Error('useCommandHub must be used within a CommandHubProvider');
  }
  return context;
};

export const CommandHubProvider = ({
  value,
  children,
}: ProviderProps<CommandHubContextType>) => {
  return (
    <CommandHubContext.Provider value={value}>
      {children}
    </CommandHubContext.Provider>
  );
};
