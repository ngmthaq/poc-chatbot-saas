import type { FC } from 'react';
import type { Components } from 'react-markdown';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MarkdownRoot } from './styled';
import type { MarkdownMessageProps } from './types';

const MARKDOWN_COMPONENTS: Components = {
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

export const MarkdownMessage: FC<MarkdownMessageProps> = ({ children }) => (
  <MarkdownRoot>
    <Markdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
      {children}
    </Markdown>
  </MarkdownRoot>
);
