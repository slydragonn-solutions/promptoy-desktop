import "./App.css";
import MainMenu from "@/components/main-menu";
import PromptList from "@/components/prompts/prompt-list";
import Editor from "@/components/editor";
import Sidebar from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <main className="flex h-screen items-center justify-center">
      <MainMenu />
      <PromptList />
      <Editor />
      <Sidebar />
      <Toaster />
    </main>
  )
}

export default App
