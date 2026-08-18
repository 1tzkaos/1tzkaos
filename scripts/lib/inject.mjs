export function injectBlock(source, name, content) {
  const start = `<!-- ${name}:START -->`
  const end = `<!-- ${name}:END -->`
  const startIndex = source.indexOf(start)
  const endIndex = source.indexOf(end)

  if (startIndex === -1) throw new Error(`injectBlock: missing start marker ${start}`)
  if (endIndex === -1) throw new Error(`injectBlock: missing end marker ${end}`)
  if (endIndex < startIndex) throw new Error(`injectBlock: end marker precedes start marker for ${name}`)

  return `${source.slice(0, startIndex + start.length)}\n${content.trim()}\n${source.slice(endIndex)}`
}
