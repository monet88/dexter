import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';
import type { Command } from '../commands/registry.js';

interface Props {
  commands: Command[];
  selectedIndex: number;
}

export const CommandSuggestions = React.memo(function CommandSuggestions({ commands, selectedIndex }: Props) {
  if (commands.length === 0) return null;

  return (
    <Box flexDirection="column" marginLeft={2}>
      {commands.map((cmd, idx) => {
        const isSelected = idx === selectedIndex;
        const prefix = isSelected ? '> ' : '  ';
        const nameWithArgs = cmd.args ? `${cmd.name} ${cmd.args}` : cmd.name;

        return (
          <Box key={cmd.name}>
            <Text color={isSelected ? colors.primaryLight : colors.muted}>
              {prefix}{nameWithArgs.padEnd(20)}
            </Text>
            <Text color={colors.muted} dimColor={!isSelected}>
              {cmd.description}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
});
