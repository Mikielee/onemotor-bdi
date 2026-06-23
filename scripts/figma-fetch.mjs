#!/usr/bin/env node
// figma-fetch.mjs — Pull a Figma node tree via the Figma REST API.
//
// Usage:
//   FIGMA_TOKEN=figd_xxx node scripts/figma-fetch.mjs <fileKey> <nodeId> [--summary]
//
// Without --summary: writes full JSON to .figma-cache/<fileKey>_<nodeId>.json
// With --summary:    also prints a compact skeleton (top-level frame names + types)
//                    so we can scan structure without loading megabytes.

import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const [,, fileKey, nodeId, ...flags] = process.argv
const summary = flags.includes('--summary')
const token = process.env.FIGMA_TOKEN

if (!token) {
  console.error('Missing FIGMA_TOKEN env var.')
  process.exit(1)
}
if (!fileKey || !nodeId) {
  console.error('Usage: FIGMA_TOKEN=... node figma-fetch.mjs <fileKey> <nodeId> [--summary]')
  process.exit(1)
}

const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`
const res = await fetch(url, { headers: { 'X-Figma-Token': token } })
if (!res.ok) {
  console.error(`Figma API ${res.status}: ${res.statusText}`)
  process.exit(1)
}
const data = await res.json()

const cacheDir = '.figma-cache'
await mkdir(cacheDir, { recursive: true })
const safeNode = nodeId.replace(/[:/]/g, '_')
const outPath = join(cacheDir, `${fileKey}_${safeNode}.json`)
await writeFile(outPath, JSON.stringify(data, null, 2))
console.log(`Wrote ${outPath} (${(JSON.stringify(data).length / 1024).toFixed(1)} KB)`)

if (summary) {
  const node = data.nodes?.[nodeId.replace(/-/g, ':')]?.document
  if (!node) {
    console.error('Node not found in response.')
    process.exit(1)
  }
  console.log(`\nNode: ${node.name}  (type: ${node.type})`)
  console.log(`Children: ${node.children?.length ?? 0}`)
  if (node.children) {
    console.log('\nTop-level frames:')
    for (const c of node.children) {
      const w = c.absoluteBoundingBox?.width?.toFixed(0) ?? '—'
      const h = c.absoluteBoundingBox?.height?.toFixed(0) ?? '—'
      console.log(`  ${c.id.padEnd(14)} ${c.type.padEnd(10)} ${w}x${h}  ${c.name}`)
    }
  }
}
