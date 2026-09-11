import { useRef } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Type policy content here...',
  minHeight = '240px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  const executeCommand = (command: string, valueArgument: string | undefined = undefined) => {
    document.execCommand(command, false, valueArgument)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInsertLink = () => {
    const url = prompt('Enter link URL:')
    if (url) {
      executeCommand('createLink', url)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs focus-within:ring-1 focus-within:ring-ring transition-all">
      {/* Editor Toolbar with Shadcn Buttons */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/40 flex-wrap">
        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('bold')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('italic')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('underline')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('strikeThrough')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('formatBlock', '<h1>')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('formatBlock', '<h2>')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('formatBlock', '<h3>')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('insertUnorderedList')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('insertOrderedList')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('formatBlock', '<blockquote>')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Quote Block"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('formatBlock', '<pre>')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleInsertLink}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Alignments */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('justifyLeft')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('justifyCenter')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('justifyRight')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1 ml-auto" />

        {/* Undo / Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('undo')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('redo')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-foreground cursor-pointer"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editable Content Canvas */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="w-full p-4 bg-transparent text-sm leading-relaxed focus:outline-none overflow-y-auto font-medium text-foreground empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60"
      />
    </div>
  )
}
