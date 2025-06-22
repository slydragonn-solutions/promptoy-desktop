import "./App.css";
import { Editor } from "@monaco-editor/react";
import MainMenu from "@/components/main-menu";

function App() {
  return (
    <main className="flex h-screen items-center justify-center">
      <MainMenu />
      <Editor height="90vh" defaultLanguage="markdown" defaultValue="# Hello promptoy.app" /> 
    </main>
  )
}

export default App
