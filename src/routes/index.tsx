import { createFileRoute } from '@tanstack/react-router'
import PromptList from "@/components/prompts/prompt-list";
import Editor from "@/components/editor/editor";
import Sidebar from "@/components/editor/sidebar";
import { Toaster } from "@/components/ui/sonner"
import { useVersionComparison } from "@/hooks/use-version-comparison";


export const Route = createFileRoute("/")({
  component: Index,
})

function Index() {
  const versionComparison = useVersionComparison();

  return (
    <>
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
    </>
  )
}