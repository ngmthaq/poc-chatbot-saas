import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const MarkdownRoot = styled(Box)({
  fontSize: '0.85rem',
  lineHeight: 1.5,
  color: 'rgba(240,244,248,0.92)',
  wordBreak: 'break-word',
  // Override the `pre-wrap` inherited from the parent chat `Bubble`. Without
  // this, react-markdown's literal `\n\n` whitespace nodes between block
  // elements render as visible blank lines. Children inherit `normal`.
  whiteSpace: 'normal',

  '& p': {
    margin: '0 0 6px',
  },

  '& p:last-child': {
    marginBottom: 0,
  },

  '& ul, & ol': {
    margin: '0 0 6px',
    paddingLeft: 18,
  },

  // Nested lists hug their parent list item: no top gap, small bottom margin.
  '& li > ul, & li > ol': {
    marginTop: 0,
    marginBottom: 4,
  },

  '& li': {
    margin: '2px 0',
  },

  '& li > p': {
    margin: 0,
  },

  '& a': {
    color: '#1f8cf9',
    textDecoration: 'underline',
  },

  '& strong': {
    fontWeight: 700,
  },

  '& em': {
    fontStyle: 'italic',
  },

  '& code': {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: '0.8rem',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    padding: '1px 4px',
  },

  '& pre': {
    margin: '0 0 6px',
    padding: '8px 10px',
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    overflowX: 'auto',
  },

  '& pre code': {
    backgroundColor: 'transparent',
    padding: 0,
  },

  '& blockquote': {
    margin: '0 0 6px',
    paddingLeft: 10,
    borderLeft: '3px solid rgba(255,255,255,0.2)',
    color: 'rgba(240,244,248,0.7)',
  },

  '& table': {
    borderCollapse: 'collapse',
    margin: '0 0 6px',
    fontSize: '0.8rem',
  },

  '& th, & td': {
    border: '1px solid rgba(255,255,255,0.15)',
    padding: '4px 8px',
  },

  '& > *:last-child': {
    marginBottom: 0,
  },
});
