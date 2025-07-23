import { Editor as MonacoEditor } from "@monaco-editor/react";
import { Button } from "../ui/button";
import { Save, SaveOff, Tags } from "lucide-react";
import { TagSelector } from "../tags/tag-selector";
import { useEditor } from "@/hooks/use-editor";
import { promptsStore } from "@/store/prompts-store";
import { MarkdownToolbar } from "./markdown-toolbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import EditorFooter from "./editor-footer";
import EditorNotFound from "./editor-not-found";
import EditorHeader from "./editor-header";
import { DiffEditor } from "./diff-editor";
import { Badge } from "../ui/badge";
import { useState } from "react";
import Alert from "../common/alert";
import { useSettingsStore } from "@/store/settings-store";
import { useTheme } from "../theme/theme-provider";
interface EditorProps {
  isComparing: boolean;
  compareVersion: {
    content: string;
    date: string;
    name?: string;
  } | null;
  onCloseCompare: () => void;
}

export default function Editor({ isComparing, compareVersion, onCloseCompare }: EditorProps) {
  const { selectedPrompt, setSelectedPrompt } = promptsStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const { editor: editorSettings } = useSettingsStore();
  const { theme } = useTheme();
  
  // Get the current version (most recent one)
  const currentVersion = selectedPrompt?.versions?.[0];
  
  const {
    content,
    isSaving,
    isRenameDialogOpen,
    newName,
    editorRef,
    setNewName,
    setIsRenameDialogOpen,
    handleEditorChange,
    handleEditorDidMount,
    handleUpdatePrompt,
    handleRename,
    handleKeyDown,
    handleCopyToClipboard,
    handleDeletePrompt,
  } = useEditor(selectedPrompt);


  if (!selectedPrompt) {
    return <EditorNotFound />;
  }

  return (
    <div className="relative bg-neutral-100 p-2 w-[calc(100vw-320px-288px-48px)] h-[calc(100vh-37px)] dark:bg-neutral-900">
      {/* Header */}
      <EditorHeader
        selectedPrompt={selectedPrompt}
        setSelectedPrompt={setSelectedPrompt}
        currentGroupId={selectedPrompt.group || null}
        setIsRenameDialogOpen={setIsRenameDialogOpen}
        setNewName={setNewName}
        handleUpdatePrompt={handleUpdatePrompt}
        handleCopyToClipboard={handleCopyToClipboard}
        handleDeletePrompt={() => setIsDeleting(true)}
      />
    <section className="relative flex flex-col gap-1 w-full bg-neutral-50 border border-neutral-200 p-2 rounded-md mt-2 overflow-hidden dark:bg-neutral-800 dark:border-neutral-700">
    <div className="flex items-center justify-between">
      <h1
        className="font-semibold text-lg cursor-text text-neutral-800 hover:text-neutral-600 px-2 py-1 rounded-md dark:text-neutral-200"
        onClick={() => {
          setNewName(selectedPrompt.name);
          setIsRenameDialogOpen(true);
        }}
      >
        {selectedPrompt.name}
      </h1>

      
        {
          isSaving
          ? <Badge variant="secondary" className="text-neutral-500"><SaveOff /> Saving...</Badge>
          : <Badge variant="secondary" className="text-neutral-500"><Save /> Saved</Badge>
        }
    </div>

      {/* Tags */}
      <TagSelector
        value={selectedPrompt.tags || []}
        onChange={(tags) => {
          // Create a new object to trigger the update
          const updatedPrompt = { ...selectedPrompt, tags };
          handleUpdatePrompt(updatedPrompt);
        }}
        className="flex flex-nowrap gap-1 overflow-x-scroll h-12"
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground hover:text-foreground rounded-full"
          >
            <Tags className="h-4 w-4 mr-1" />
            {selectedPrompt.tags?.length
              ? `${selectedPrompt.tags.length} tags`
              : "Add tags"}
          </Button>
        }
        selectedPrompt={selectedPrompt}
      />

      {/* Editor */}
      <div className="relative h-full">
        {!isComparing && editorSettings.showToolbar && (
          <MarkdownToolbar 
            editorRef={editorRef} 
            onCopy={handleCopyToClipboard} 
          />
        )}
        {isComparing && compareVersion ? (
          <div className="h-full border rounded-md overflow-hidden">
            <DiffEditor
              original={compareVersion.content}
              modified={content}
              originalTitle={`${compareVersion.name || 'Version'} (${new Date(compareVersion.date).toLocaleString()})`}
              modifiedTitle={`${currentVersion?.name || 'Current Version'} (${new Date(currentVersion?.date || selectedPrompt?.updatedAt).toLocaleString()})`}
              onClose={onCloseCompare}
            />
          </div>
        ) : (
          <MonacoEditor
            height="calc(100vh - 317px)"
            defaultLanguage="markdown"
            value={content}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: true },
              fontSize: editorSettings.fontSize,
              wordWrap: "on",
              automaticLayout: true,
              padding: { top: 16 },
            }}
            theme={theme === "system" ? "vs-dark" : theme === "dark" ? "vs-dark" : "light"}
          />
        )}
      </div>

      {/* Rename Prompt Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Prompt</DialogTitle>
            <DialogDescription>
              Enter a new name for your prompt.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="relative">
              <div className="relative">
                <Input
                  type="text"
                  value={newName}
                  onChange={(e) => {
                    if (e.target.value.length <= 50) {
                      setNewName(e.target.value);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full pr-16"
                  autoFocus
                  placeholder="Enter prompt name"
                  maxLength={50}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {newName.length}/50
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsRenameDialogOpen(false);
                setNewName("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              className="bg-indigo-400 hover:bg-indigo-500"
              disabled={!newName.trim() || newName.trim().length > 50}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
    {/* Footer */}
    <EditorFooter selectedPrompt={selectedPrompt} content={content} />
    <Alert open={isDeleting} onOpenChange={setIsDeleting} title="Delete Prompt" description="Are you sure you want to delete this prompt?" onAction={() => handleDeletePrompt()} actionText="Delete" />
    </div>
  );
}

