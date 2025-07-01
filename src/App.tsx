import "./App.css";
import MainMenu from "@/components/main-menu";
import PromptList from "@/components/prompts/prompt-list";
import Editor from "@/components/editor/editor";
import Sidebar from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner"
import { useVersionComparison } from "@/hooks/use-version-comparison";

function App() {
  const versionComparison = useVersionComparison();

  return (
    <main className="flex h-screen items-center justify-center">
      <MainMenu />
      <PromptList />
      <Editor 
        isComparing={versionComparison.isComparing}
        compareVersion={versionComparison.compareVersion}
        onCloseCompare={versionComparison.handleCloseCompare}
      />
      <Sidebar 
        onCompareVersion={versionComparison.handleCompareVersion}
        isComparing={versionComparison.isComparing}
      />
      <Toaster />
    </main>
  )
}

export default App
