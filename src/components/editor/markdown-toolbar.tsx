import { Button } from "../ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  Bold, 
  Italic, 
  Strikethrough, 
  Link2, 
  List, 
  ListOrdered, 
  SquareCheck, 
  Code, 
  SquareCode, 
  Quote, 
  Copy,
  ChevronDown
} from "lucide-react";
import type { editor } from 'monaco-editor';
import type { MutableRefObject } from 'react';

interface MarkdownToolbarProps {
  editorRef: MutableRefObject<editor.IStandaloneCodeEditor | null>;
  onCopy?: (text: string) => void;
}

export function MarkdownToolbar({ editorRef, onCopy }: MarkdownToolbarProps) {
  const executeAction = (action: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    const model = editor.getModel();
    if (!model) return;

    const range = {
      startLineNumber: selection?.startLineNumber || 1,
      startColumn: selection?.startColumn || 1,
      endLineNumber: selection?.endLineNumber || 1,
      endColumn: selection?.endColumn || 1,
    };

    const selectedText = model.getValueInRange(range);
    let newText = '';
    let cursorOffset = 0;

    switch (action) {
      case 'h1':
        newText = `# ${selectedText || 'Heading 1'}`;
        cursorOffset = selectedText ? 0 : -8;
        break;
      case 'h2':
        newText = `## ${selectedText || 'Heading 2'}`;
        cursorOffset = selectedText ? 0 : -8;
        break;
      case 'h3':
        newText = `### ${selectedText || 'Heading 3'}`;
        cursorOffset = selectedText ? 0 : -8;
        break;
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        cursorOffset = selectedText ? 0 : -9;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        cursorOffset = selectedText ? 0 : -1;
        break;
      case 'strikethrough':
        newText = `~~${selectedText || 'strikethrough text'}~~`;
        cursorOffset = selectedText ? 0 : -2;
        break;
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`;
        cursorOffset = selectedText ? -4 : -12;
        break;
      case 'ul':
        newText = selectedText 
          ? selectedText.split('\n').map((line: string) => `- ${line}`).join('\n')
          : '- List item';
        cursorOffset = selectedText ? 0 : -9;
        break;
      case 'ol':
        newText = selectedText 
          ? selectedText.split('\n').map((line: string, i: number) => `${i + 1}. ${line}`).join('\n')
          : '1. List item';
        cursorOffset = selectedText ? 0 : -9;
        break;
      case 'checkbox':
        newText = selectedText
          ? selectedText.split('\n').map((line: string) => `- [ ] ${line}`).join('\n')
          : '- [ ] Task';
        cursorOffset = selectedText ? 0 : -5;
        break;
      case 'code':
        newText = `\`${selectedText || 'code'}\``;
        cursorOffset = selectedText ? 0 : -5;
        break;
      case 'codeblock':
        newText = selectedText ? `\`\`\`\n${selectedText}\n\`\`\`` : '```\n\n```';
        cursorOffset = selectedText ? -3 : -4;
        break;
      case 'quote':
        newText = selectedText 
          ? selectedText.split('\n').map((line: string) => `> ${line}`).join('\n')
          : '> Quote';
        cursorOffset = selectedText ? 0 : -6;
        break;
      case 'copy': {
        const text = selectedText || model.getValue();
        if (onCopy) {
          onCopy(text);
        } else {
          navigator.clipboard.writeText(text);
        }
        return;
      }
    }

    editor.executeEdits('markdown-toolbar', [
      {
        range,
        text: newText,
        forceMoveMarkers: true
      }
    ]);

    // Position cursor
    if (cursorOffset !== 0) {
      const position = {
        lineNumber: range.startLineNumber,
        column: range.startColumn + newText.length + cursorOffset
      };
      editor.setPosition(position);
      editor.focus();
    }
  };

  return (
    <div className="flex flex-wrap gap-1 py-2 px-6 bg-neutral-100 rounded-full mb-2">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            title="Headings"
          >
            <div className="flex items-center">
              <Heading1 className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 ml-0.5 opacity-50" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem 
            className="flex items-center gap-2"
            onClick={() => executeAction('h1')}
          >
            <Heading1 className="h-4 w-4" />
            <span>Heading 1</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-2"
            onClick={() => executeAction('h2')}
          >
            <Heading2 className="h-4 w-4" />
            <span>Heading 2</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-2"
            onClick={() => executeAction('h3')}
          >
            <Heading3 className="h-4 w-4" />
            <span>Heading 3</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={() => executeAction('bold')}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={() => executeAction('italic')}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={() => executeAction('strikethrough')}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <div className="h-8 w-px bg-border mx-1" />
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={() => executeAction('link')}
        title="Link"
      >
        <Link2 className="h-4 w-4" />
      </Button>
      <div className="h-8 w-px bg-border mx-1" />
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={() => executeAction('ul')}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={() => executeAction('ol')}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={() => executeAction('checkbox')}
        title="Task List"
      >
        <SquareCheck className="h-4 w-4" />
      </Button>
      <div className="h-8 w-px bg-border mx-1" />
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={() => executeAction('code')}
        title="Inline Code"
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={() => executeAction('codeblock')}
        title="Code Block"
      >
        <SquareCode className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={() => executeAction('quote')}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <div className="h-8 w-px bg-border mx-1" />
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 ml-auto"
        onClick={() => executeAction('copy')}
        title="Copy to Clipboard"
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}
