import { useMemo } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  ClassicEditor,
  Bold,
  Essentials,
  Italic,
  Underline,
  Strikethrough,
  Paragraph,
  Heading,
  List,
  Link,
  BlockQuote,
  Alignment,
  CodeBlock,
  Table,
  TableToolbar,
  Undo,
} from 'ckeditor5'

import 'ckeditor5/ckeditor5.css'

export interface RichEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  className?: string
}

export function RichEditor({
  value,
  onChange,
  placeholder = 'Type content here...',
  minHeight = '240px',
  className = '',
}: RichEditorProps) {
  const editorConfig = useMemo(
    () => ({
      licenseKey: 'GPL',
      plugins: [
        Essentials,
        Paragraph,
        Heading,
        Bold,
        Italic,
        Underline,
        Strikethrough,
        List,
        Link,
        BlockQuote,
        Alignment,
        CodeBlock,
        Table,
        TableToolbar,
        Undo,
      ],
      toolbar: [
        'undo',
        'redo',
        '|',
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'alignment',
        '|',
        'bulletedList',
        'numberedList',
        '|',
        'link',
        'blockQuote',
        'codeBlock',
        'insertTable',
      ],
      placeholder,
      heading: {
        options: [
          {
            model: 'paragraph',
            title: 'Paragraph',
            class: 'ck-heading_paragraph',
          },
          {
            model: 'heading1',
            view: 'h1',
            title: 'Heading 1',
            class: 'ck-heading_heading1',
          },
          {
            model: 'heading2',
            view: 'h2',
            title: 'Heading 2',
            class: 'ck-heading_heading2',
          },
          {
            model: 'heading3',
            view: 'h3',
            title: 'Heading 3',
            class: 'ck-heading_heading3',
          },
        ],
      },
      table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
      },
    }),
    [placeholder]
  )

  return (
    <div
      className={`rich-editor-wrapper rounded-2xl overflow-hidden border border-border shadow-xs bg-card focus-within:ring-1 focus-within:ring-ring transition-all ${className}`}
    >
      <style>{`
        .rich-editor-wrapper .ck-editor__editable_inline {
          min-height: ${minHeight};
          padding: 1rem 1.25rem;
          font-size: 0.875rem;
          line-height: 1.625;
          background-color: var(--card, #ffffff);
          color: var(--foreground, #0f172a);
        }
        .rich-editor-wrapper .ck.ck-toolbar {
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          border-bottom: 1px solid var(--border, #e2e8f0) !important;
          background-color: var(--muted, #f8fafc) !important;
          border-radius: 1rem 1rem 0 0 !important;
        }
        .rich-editor-wrapper .ck.ck-editor__main > .ck-editor__editable {
          border: none !important;
          border-radius: 0 0 1rem 1rem !important;
          box-shadow: none !important;
        }
        .rich-editor-wrapper .ck.ck-editor__editable:not(.ck-editor__nested-editable).ck-focused {
          box-shadow: none !important;
          outline: none !important;
        }
      `}</style>
      <CKEditor
        editor={ClassicEditor}
        data={value || ''}
        config={editorConfig as any}
        onChange={(_event, editor) => {
          const data = editor.getData()
          onChange(data)
        }}
      />
    </div>
  )
}

export default RichEditor
