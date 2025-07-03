import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { promptsStore } from "@/store/prompts-store"
import { useTabs } from "@/hooks/use-tabs"
import NoteList from "../notes/note-list"
import VersionList from "../versions/version-list"
import { PromptContent } from "@/types/prompts"
import { GitCompare, Notebook } from "lucide-react"

interface SidebarProps {
  onCompareVersion?: (version: PromptContent) => void;
  isComparing?: boolean;
}

export default function Sidebar({ onCompareVersion, isComparing = false }: SidebarProps) {
    const { selectedPrompt } = promptsStore();
    
    // Tabs management
    const { activeTab, handleTabChange } = useTabs('versions');
    
    
    if (!selectedPrompt) {
        return (
            <section className="flex flex-col gap-2 min-w-80 w-80 h-screen p-2 border-l border-l-neutral-200">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Select a prompt to view versions</p>
                </div>
            </section>
        );
    }
    
    return (
        <section className="flex flex-col gap-2 min-w-80 h-full w-80 p-2 border-l border-l-neutral-200">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="w-full rounded-full bg-neutral-100 shadow-lg p-0">
                    <TabsTrigger value="versions" className="rounded-full text-neutral-600" title="Versions"><GitCompare className="w-4 h-4" /></TabsTrigger>
                    <TabsTrigger value="notes" className="rounded-full text-neutral-600" title="Notes"><Notebook className="w-4 h-4" /></TabsTrigger>
                </TabsList>
                <TabsContent value="versions">
                    <VersionList 
                      onCompareVersion={onCompareVersion}
                      isComparing={isComparing}
                    />
                </TabsContent>
                <TabsContent value="notes">
                    <NoteList />
                </TabsContent>
            </Tabs>
        </section>
    )
}