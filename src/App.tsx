import { Button } from "@/components/ui/button"
import "./App.css";
import { Editor } from "@monaco-editor/react";

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button variant="outline">Click me</Button>
      <Editor height="90vh" defaultLanguage="markdown" defaultValue="# Hello promptoy.app" /> 
    </div>
  )
}

export default App
