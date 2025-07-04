import { createFileRoute } from '@tanstack/react-router'
import EditorLayout from '@/layouts/editor-layout'

export const Route = createFileRoute("/favorites")({
  component: Favorites,
})

function Favorites() {
  return <EditorLayout listBy="favorites" title="Favorites"/>
}