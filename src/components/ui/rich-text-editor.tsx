import { useRef, useEffect, useState } from 'react'
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
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

interface ActiveFormats {
  bold: boolean
  italic: boolean
  underline: boolean
  strikeThrough: boolean
  h1: boolean
  h2: boolean
  h3: boolean
  unorderedList: boolean
  orderedList: boolean
  blockquote: boolean
  code: boolean
  link: boolean
  justifyLeft: boolean
  justifyCenter: boolean
  justifyRight: boolean
}

const initialFormats: ActiveFormats = {
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  h1: false,
  h2: false,
  h3: false,
  unorderedList: false,
  orderedList: false,
  blockquote: false,
  code: false,
  link: false,
  justifyLeft: false,
  justifyCenter: false,
  justifyRight: false,
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Type policy content here...',
  minHeight = '240px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>(initialFormats)

  // Sync value into editor only when external value differs from current innerHTML
  useEffect(() => {
    const safeValue = value || ''
    if (editorRef.current && editorRef.current.innerHTML !== safeValue) {
      editorRef.current.innerHTML = safeValue
    }
  }, [value])

  // Detect active formatting for current selection
  const updateActiveFormats = () => {
    if (!editorRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const anchorNode = selection.anchorNode
    if (!anchorNode || !editorRef.current.contains(anchorNode)) return

    try {
      const rawBlock = document.queryCommandValue('formatBlock') || ''
      const block = rawBlock.toLowerCase().replace(/<|>/g, '')

      let inLink = false
      let curr: Node | null = anchorNode
      while (curr && curr !== editorRef.current) {
        if (curr.nodeName === 'A') {
          inLink = true
          break
        }
        curr = curr.parentNode
      }

      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        h1: block === 'h1',
        h2: block === 'h2',
        h3: block === 'h3',
        unorderedList: document.queryCommandState('insertUnorderedList'),
        orderedList: document.queryCommandState('insertOrderedList'),
        blockquote: block === 'blockquote',
        code: block === 'pre',
        link: inLink,
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
      })
    } catch {
      // Ignore command queries if document is not in editable state
    }
  }

  // Listen to selection changes across the document
  useEffect(() => {
    const handleSelection = () => {
      updateActiveFormats()
    }

    document.addEventListener('selectionchange', handleSelection)
    return () => {
      document.removeEventListener('selectionchange', handleSelection)
    }
  }, [])

  const executeCommand = (command: string, valueArgument: string | undefined = undefined) => {
    document.execCommand(command, false, valueArgument)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
    updateActiveFormats()
  }

  const toggleHeading = (tag: 'h1' | 'h2' | 'h3') => {
    if (activeFormats[tag]) {
      executeCommand('formatBlock', '<p>')
    } else {
      executeCommand('formatBlock', `<${tag}>`)
    }
  }

  const toggleBlock = (tag: 'blockquote' | 'pre') => {
    const isCurrent = tag === 'blockquote' ? activeFormats.blockquote : activeFormats.code
    if (isCurrent) {
      executeCommand('formatBlock', '<p>')
    } else {
      executeCommand('formatBlock', `<${tag}>`)
    }
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
    updateActiveFormats()
  }

  const handleInsertLink = () => {
    const url = prompt('Enter link URL:')
    if (url) {
      executeCommand('createLink', url)
    }
  }

  const getBtnClass = (isActive: boolean) =>
    cn(
      'h-8 w-8 p-0 rounded-lg cursor-pointer transition-all border',
      isActive
        ? 'bg-primary/15 text-primary hover:bg-primary/25 border-primary/30 shadow-xs font-bold'
        : 'text-muted-foreground hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-foreground border-transparent'
    )

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs focus-within:ring-1 focus-within:ring-ring transition-all">
      {/* Editor Toolbar with Shadcn Buttons */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/40 flex-wrap">
        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand('bold')}
          className={getBtnClass(activeFormats.bold)}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand('italic')}
          className={getBtnClass(activeFormats.italic)}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand('underline')}
          className={getBtnClass(activeFormats.underline)}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand('strikeThrough')}
          className={getBtnClass(activeFormats.strikeThrough)}
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
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleHeading('h1')}
          className={getBtnClass(activeFormats.h1)}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleHeading('h2')}
          className={getBtnClass(activeFormats.h2)}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleHeading('h3')}
          className={getBtnClass(activeFormats.h3)}
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
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand('insertUnorderedList')}
          className={getBtnClass(activeFormats.unorderedList)}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand('insertOrderedList')}
          className={getBtnClass(activeFormats.orderedList)}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleBlock('blockquote')}
          className={getBtnClass(activeFormats.blockquote)}
          title="Quote Block"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleBlock('pre')}
          className={getBtnClass(activeFormats.code)}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleInsertLink}
          className={getBtnClass(activeFormats.link)}
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
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand('justifyLeft')}
          className={getBtnClass(activeFormats.justifyLeft)}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand('justifyCenter')}
          className={getBtnClass(activeFormats.justifyCenter)}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand('justifyRight')}
          className={getBtnClass(activeFormats.justifyRight)}
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
          onMouseDown={(e) => e.preventDefault()}
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
          onMouseDown={(e) => e.preventDefault()}
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
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onFocus={updateActiveFormats}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="w-full p-4 bg-transparent text-sm leading-relaxed focus:outline-none overflow-y-auto font-medium text-foreground empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60"
      />
    </div>
  )
}
