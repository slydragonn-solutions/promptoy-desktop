import "./App.css";
import MainMenu from "@/components/main-menu";
import PromptList from "@/components/prompt/prompt-list";
import Editor from "@/components/editor";
import Sidebar from "@/components/sidebar";

function App() {
  return (
    <main className="flex h-screen items-center justify-center">
      <MainMenu />
      <PromptList />
      <Editor />
      <Sidebar />
    </main>
  )
}

export default App
