import { useState, useCallback } from 'react';
import {
  addProfile,
  deleteProfile,
  listProfiles,
  getActiveProfile,
  setActiveProfile,
  type Profile,
} from '../config/index.js';
import type { EndpointProfile } from '../components/SettingsView.js';

type SettingsState = 'idle' | 'list' | 'add' | 'help';

export interface UseSettingsResult {
  settingsState: SettingsState;
  profiles: EndpointProfile[];
  startList: () => void;
  startAdd: () => void;
  showHelp: () => void;
  closeSettings: () => void;
  handleProfileSubmit: (profile: EndpointProfile | null) => { success: boolean; error?: string };
  handleProfileDelete: (name: string) => { success: boolean; error?: string };
  handleProfileActivate: (profile: EndpointProfile) => { success: boolean; error?: string };
  isInSettingsFlow: () => boolean;
}

function toEndpointProfile(p: Profile, activeName: string | null): EndpointProfile {
  return {
    name: p.name,
    baseUrl: p.baseUrl,
    apiKey: p.apiKey ?? '',
    defaultModel: p.defaultModel,
    isActive: p.name === activeName,
  };
}

export function useSettings(): UseSettingsResult {
  const [settingsState, setSettingsState] = useState<SettingsState>('idle');

  const getProfiles = useCallback((): EndpointProfile[] => {
    const active = getActiveProfile();
    return listProfiles().map((p) => toEndpointProfile(p, active?.name ?? null));
  }, []);

  const [profiles, setProfiles] = useState<EndpointProfile[]>(() => getProfiles());

  const refreshProfiles = useCallback(() => {
    setProfiles(getProfiles());
  }, [getProfiles]);

  const startList = useCallback(() => {
    refreshProfiles();
    setSettingsState('list');
  }, [refreshProfiles]);

  const startAdd = useCallback(() => {
    refreshProfiles();
    setSettingsState('add');
  }, [refreshProfiles]);

  const showHelp = useCallback(() => {
    setSettingsState('help');
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsState('idle');
  }, []);

  const handleProfileSubmit = useCallback(
    (profile: EndpointProfile | null): { success: boolean; error?: string } => {
      if (!profile) {
        setSettingsState('idle');
        return { success: true };
      }

      try {
        addProfile({
          name: profile.name,
          baseUrl: profile.baseUrl,
          apiKey: profile.apiKey || undefined,
          defaultModel: profile.defaultModel,
        });
        refreshProfiles();
        setSettingsState('list');
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to add profile' };
      }
    },
    [refreshProfiles]
  );

  const handleProfileDelete = useCallback(
    (name: string): { success: boolean; error?: string } => {
      try {
        deleteProfile(name);
        refreshProfiles();
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to delete profile' };
      }
    },
    [refreshProfiles]
  );

  const handleProfileActivate = useCallback(
    (profile: EndpointProfile): { success: boolean; error?: string } => {
      try {
        setActiveProfile(profile.name);
        refreshProfiles();
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to activate profile' };
      }
    },
    [refreshProfiles]
  );

  const isInSettingsFlow = useCallback(() => {
    return settingsState !== 'idle';
  }, [settingsState]);

  return {
    settingsState,
    profiles,
    startList,
    startAdd,
    showHelp,
    closeSettings,
    handleProfileSubmit,
    handleProfileDelete,
    handleProfileActivate,
    isInSettingsFlow,
  };
}
