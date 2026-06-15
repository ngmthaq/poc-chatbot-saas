import { useChatForm } from '@/hooks/forms';
import { Send as SendIcon } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { type FC, type KeyboardEvent } from 'react';
import {
  ErrorText,
  InputRow,
  MessageField,
  PanelRoot,
  SendButton,
} from './styled';

export const ChatPanel: FC = () => {
  const { formik, isPending, error } = useChatForm();

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
          multiline
          maxRows={4}
          size="small"
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
