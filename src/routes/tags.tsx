import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute("/tags")({
  component: Tags,
})

function Tags() {

  return (
    <div className="flex h-screen w-full items-center justify-center">
      Tags
    </div>
  )
}