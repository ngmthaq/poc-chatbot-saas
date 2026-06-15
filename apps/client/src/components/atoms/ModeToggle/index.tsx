import { useChatMode } from '@/hooks/stores';
import type { ChatMode } from '@/types/conversation';
import type { FC, MouseEvent } from 'react';
import { MODE_OPTIONS } from './configs';
import { StyledToggleButton, StyledToggleButtonGroup } from './styled';

export const ModeToggle: FC = () => {
  const [mode, setMode] = useChatMode();

  const handleChange = (
    _event: MouseEvent<HTMLElement>,
    nextMode: ChatMode | null,
  ) => {
    if (nextMode !== null) {
      setMode(nextMode);
    }
  };

  return (
    <StyledToggleButtonGroup
      exclusive
      value={mode}
      onChange={handleChange}
      aria-label="chat mode"
    >
      {MODE_OPTIONS.map(({ value, label, Icon }) => (
        <StyledToggleButton key={value} value={value} aria-label={label}>
          <Icon />
          {label}
        </StyledToggleButton>
      ))}
    </StyledToggleButtonGroup>
  );
};
