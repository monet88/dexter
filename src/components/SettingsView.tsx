import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';

// Types for custom endpoint profiles
export interface EndpointProfile {
  name: string;
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  isActive?: boolean;
}

type InputStep = 'name' | 'baseUrl' | 'apiKey' | 'defaultModel';

interface ProfileInputProps {
  onSubmit: (profile: EndpointProfile | null) => void;
  existingNames?: string[];
}

export function ProfileInput({ onSubmit, existingNames = [] }: ProfileInputProps) {
  const [step, setStep] = useState<InputStep>('name');
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [defaultModel, setDefaultModel] = useState('');
  const [error, setError] = useState('');

  const currentValue = {
    name,
    baseUrl,
    apiKey,
    defaultModel,
  }[step];

  const setCurrentValue = {
    name: setName,
    baseUrl: setBaseUrl,
    apiKey: setApiKey,
    defaultModel: setDefaultModel,
  }[step];

  const stepLabels: Record<InputStep, string> = {
    name: 'Profile Name',
    baseUrl: 'Base URL',
    apiKey: 'API Key',
    defaultModel: 'Default Model',
  };

  const stepHints: Record<InputStep, string> = {
    name: 'A unique name for this endpoint profile',
    baseUrl: 'e.g., https://api.openai.com/v1',
    apiKey: 'Your API key (will be stored securely)',
    defaultModel: 'e.g., gpt-4, claude-3-opus',
  };

  const validateAndProceed = () => {
    const trimmed = currentValue.trim();

    if (!trimmed) {
      setError('This field is required');
      return;
    }

    if (step === 'name' && existingNames.includes(trimmed)) {
      setError('Profile name already exists');
      return;
    }

    if (step === 'baseUrl' && !trimmed.startsWith('http')) {
      setError('URL must start with http:// or https://');
      return;
    }

    setError('');

    if (step === 'name') {
      setStep('baseUrl');
    } else if (step === 'baseUrl') {
      setStep('apiKey');
    } else if (step === 'apiKey') {
      setStep('defaultModel');
    } else {
      onSubmit({
        name: name.trim(),
        baseUrl: baseUrl.trim(),
        apiKey: apiKey.trim(),
        defaultModel: defaultModel.trim(),
      });
    }
  };

  useInput((input, key) => {
    if (key.return) {
      validateAndProceed();
    } else if (key.escape) {
      onSubmit(null);
    } else if (key.backspace || key.delete) {
      setCurrentValue((prev) => prev.slice(0, -1));
      setError('');
    } else if (input && !key.ctrl && !key.meta) {
      setCurrentValue((prev) => prev + input);
      setError('');
    }
  });

  const displayValue = step === 'apiKey' && currentValue.length > 0
    ? '*'.repeat(currentValue.length)
    : currentValue;

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color={colors.primary} bold>
        Add Custom Endpoint Profile
      </Text>
      <Text color={colors.muted}>
        Step {['name', 'baseUrl', 'apiKey', 'defaultModel'].indexOf(step) + 1}/4: {stepLabels[step]}
      </Text>

      <Box marginTop={1} flexDirection="column">
        <Text color={colors.muted}>{stepHints[step]}</Text>
        <Box marginTop={1}>
          <Text color={colors.primaryLight}>{`> `}</Text>
          <Text color={colors.primary}>{displayValue}</Text>
          <Text color={colors.primaryLight}>_</Text>
        </Box>
        {error && (
          <Text color={colors.error}>{error}</Text>
        )}
      </Box>

      <Box marginTop={1}>
        <Text color={colors.muted}>Enter to continue · Esc to cancel</Text>
      </Box>
    </Box>
  );
}

interface ProfileListProps {
  profiles: EndpointProfile[];
  onSelect?: (profile: EndpointProfile) => void;
  onDelete?: (profileName: string) => void;
}

export function ProfileList({ profiles, onSelect, onDelete }: ProfileListProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (profiles.length === 0) return;

    if (key.upArrow || input === 'k') {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow || input === 'j') {
      setSelectedIndex((prev) => Math.min(profiles.length - 1, prev + 1));
    } else if (key.return && onSelect) {
      onSelect(profiles[selectedIndex]);
    } else if ((input === 'd' || key.delete) && onDelete) {
      onDelete(profiles[selectedIndex].name);
    }
  });

  if (profiles.length === 0) {
    return (
      <Box flexDirection="column" marginTop={1}>
        <Text color={colors.primary} bold>Custom Endpoint Profiles</Text>
        <Text color={colors.muted}>No profiles configured. Use /settings add to create one.</Text>
      </Box>
    );
  }

  const colWidths = { name: 15, baseUrl: 30, model: 20, status: 10 };

  const truncate = (str: string, len: number) =>
    str.length > len ? str.slice(0, len - 2) + '..' : str.padEnd(len);

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color={colors.primary} bold>Custom Endpoint Profiles</Text>

      <Box marginTop={1} flexDirection="column">
        <Text color={colors.muted} bold>
          {truncate('Name', colWidths.name)}
          {truncate('Base URL', colWidths.baseUrl)}
          {truncate('Model', colWidths.model)}
          {truncate('Status', colWidths.status)}
        </Text>
        <Text color={colors.muted}>{'─'.repeat(colWidths.name + colWidths.baseUrl + colWidths.model + colWidths.status)}</Text>

        {profiles.map((profile, idx) => {
          const isSelected = idx === selectedIndex;
          const prefix = isSelected ? '> ' : '  ';
          const statusText = profile.isActive ? '[active]' : '';

          return (
            <Text
              key={profile.name}
              color={isSelected ? colors.primaryLight : colors.primary}
              bold={isSelected}
              dimColor={!profile.isActive && !isSelected}
            >
              {prefix}
              {truncate(profile.name, colWidths.name - 2)}
              {truncate(profile.baseUrl, colWidths.baseUrl)}
              {truncate(profile.defaultModel, colWidths.model)}
              {statusText}
            </Text>
          );
        })}
      </Box>

      <Box marginTop={1}>
        <Text color={colors.muted}>
          j/k to navigate · Enter to activate · d to delete
        </Text>
      </Box>
    </Box>
  );
}

export function SettingsHelp() {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color={colors.primary} bold>Settings Commands</Text>

      <Box marginTop={1} flexDirection="column">
        <Text>
          <Text color={colors.primaryLight}>/settings</Text>
          <Text color={colors.muted}> - List all custom endpoint profiles</Text>
        </Text>
        <Text>
          <Text color={colors.primaryLight}>/settings add</Text>
          <Text color={colors.muted}> - Add a new custom endpoint profile</Text>
        </Text>
        <Text>
          <Text color={colors.primaryLight}>/settings remove {'<name>'}</Text>
          <Text color={colors.muted}> - Remove a profile by name</Text>
        </Text>
        <Text>
          <Text color={colors.primaryLight}>/settings activate {'<name>'}</Text>
          <Text color={colors.muted}> - Set a profile as active</Text>
        </Text>
        <Text>
          <Text color={colors.primaryLight}>/use {'<name>'}</Text>
          <Text color={colors.muted}> - Quick switch to a profile</Text>
        </Text>
      </Box>

      <Box marginTop={1}>
        <Text color={colors.muted}>
          Profiles are stored in ~/.dexter/settings.json
        </Text>
      </Box>
    </Box>
  );
}
