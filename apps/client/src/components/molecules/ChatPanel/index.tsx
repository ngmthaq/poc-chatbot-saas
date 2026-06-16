import { Send as SendIcon } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { type FC, type KeyboardEvent, useEffect, useRef } from 'react';
import {
  ErrorText,
  InputRow,
  MessageField,
  PanelRoot,
  SendButton,
} from './styled';
import type { ChatPanelProps } from './types';

export const ChatPanel: FC<ChatPanelProps> = ({ formik, isPending, error }) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wasPendingRef = useRef(isPending);

  useEffect(() => {
    if (wasPendingRef.current && !isPending) {
      inputRef.current?.focus();
    }
    wasPendingRef.current = isPending;
  }, [isPending]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      formik.handleSubmit();
    }
  };

  return (
    <PanelRoot onSubmit={formik.handleSubmit}>
      <InputRow>
        <MessageField
          name="message"
          value={formik.values.message}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          disabled={isPending}
          inputRef={inputRef}
          multiline
          maxRows={4}
          size="medium"
        />
        <SendButton
          type="submit"
          aria-label="send message"
          disabled={isPending || formik.values.message.trim().length === 0}
        >
          {isPending ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SendIcon />
          )}
        </SendButton>
      </InputRow>
      {error !== null && (
        <ErrorText variant="caption">
          Failed to send message. Please try again.
        </ErrorText>
      )}
    </PanelRoot>
  );
};
