import {
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  MicNone as MicNoneIcon,
} from '@mui/icons-material';
import type { ModeOption } from './types';

export const MODE_OPTIONS: ModeOption[] = [
  { value: 'text', label: 'Text', Icon: ChatBubbleOutlineIcon },
  { value: 'voice', label: 'Voice', Icon: MicNoneIcon },
];
