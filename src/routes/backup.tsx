import { createFileRoute } from '@tanstack/react-router'
import EditorLayout from '@/layouts/editor-layout'

export const Route = createFileRoute("/backup")({
  component: Backup,
})

function Backup() {
  return <EditorLayout listBy="backup" title="Backup Prompts"/>
}