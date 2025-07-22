import { createFileRoute } from '@tanstack/react-router'
import EditorLayout from '@/layouts/editor-layout'

export const Route = createFileRoute("/vault")({
  component: AllPrompts,
})

function AllPrompts() {
  return <EditorLayout listBy="all" title="Vault"/>
}