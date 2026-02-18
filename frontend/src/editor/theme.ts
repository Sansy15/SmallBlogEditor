import type { EditorThemeClasses } from 'lexical';

export const editorTheme: EditorThemeClasses = {
  paragraph: 'mb-3 text-lg leading-relaxed text-neutral-100',
  heading: {
    h1: 'text-4xl font-bold mb-4 mt-6 text-neutral-50',
    h2: 'text-3xl font-bold mb-3 mt-5 text-neutral-50',
    h3: 'text-2xl font-semibold mb-2 mt-4 text-neutral-50',
  },
  list: {
    ul: 'list-disc list-inside mb-3 space-y-1',
    ol: 'list-decimal list-inside mb-3 space-y-1',
    listitem: 'text-lg text-neutral-100',
  },
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
};
