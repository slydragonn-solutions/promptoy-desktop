import { createFileRoute } from '@tanstack/react-router'
import EditorLayout from '@/layouts/editor-layout'

export const Route = createFileRoute("/local")({
  component: Local,
})

function Local() {
  return <EditorLayout listBy="local" title="Local Prompts"/>
}