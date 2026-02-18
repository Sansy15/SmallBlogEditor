import { useCallback, useState, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  $createParagraphNode,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode } from '@lexical/rich-text';
import { $isHeadingNode } from '@lexical/rich-text';
import { $isListNode } from '@lexical/list';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { mergeRegister } from '@lexical/utils';
import type { HeadingTagType } from '@lexical/rich-text';

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-neutral-800 text-neutral-50 shadow-sm shadow-neutral-900/60 scale-[1.02]'
          : 'text-neutral-300 hover:bg-neutral-900/60 hover:text-neutral-50'
      }`}
    >
      {children}
    </button>
  );
}

export function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [blockType, setBlockType] = useState<string>('paragraph');

  const formatBold = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  }, [editor]);

  const formatItalic = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  }, [editor]);

  const formatHeading = useCallback(
    (tag: HeadingTagType) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(tag));
        }
      });
    },
    [editor]
  );

  const formatParagraph = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  }, [editor]);

  const formatBulletList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const formatNumberedList = useCallback(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            const anchorNode = selection.anchor.getNode();
            const element = anchorNode.getTopLevelElementOrThrow();
            if ($isHeadingNode(element)) {
              setBlockType(element.getTag());
            } else if ($isListNode(element.getParent())) {
              setBlockType('list');
            } else {
              setBlockType('paragraph');
            }
          }
        });
      })
    );
  }, [editor]);

  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/70 px-1.5 py-1">
      <div className="flex items-center gap-1">
        <ToolbarButton active={isBold} onClick={formatBold} title="Bold (Ctrl+B)">
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton active={isItalic} onClick={formatItalic} title="Italic (Ctrl+I)">
          <em>I</em>
        </ToolbarButton>
      </div>
      <span className="mx-1 h-4 w-px bg-neutral-800" />
      <div className="flex items-center gap-1">
        <ToolbarButton
          active={blockType === 'paragraph'}
          onClick={formatParagraph}
          title="Paragraph"
        >
          P
        </ToolbarButton>
        <ToolbarButton
          active={blockType === 'h1'}
          onClick={() => formatHeading('h1')}
          title="Heading 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          active={blockType === 'h2'}
          onClick={() => formatHeading('h2')}
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={blockType === 'h3'}
          onClick={() => formatHeading('h3')}
          title="Heading 3"
        >
          H3
        </ToolbarButton>
      </div>
      <span className="mx-1 h-4 w-px bg-neutral-800" />
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={formatBulletList} title="Bullet list">
          • List
        </ToolbarButton>
        <ToolbarButton onClick={formatNumberedList} title="Numbered list">
          1. List
        </ToolbarButton>
      </div>
    </div>
  );
}
