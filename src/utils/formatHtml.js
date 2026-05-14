const VOID_TAGS = /^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)[\s>]/i

export function formatHtml(html) {
  let indent = 0
  return html
    .replace(/>\s*</g, '>\n<')
    .split('\n')
    .map(line => {
      line = line.trim()
      if (!line) return ''
      if (line.startsWith('</')) indent = Math.max(0, indent - 1)
      const result = '  '.repeat(indent) + line
      if (!line.startsWith('</') && !line.endsWith('/>') && !VOID_TAGS.test(line) && !line.includes('</')) indent++
      return result
    })
    .filter(Boolean)
    .join('\n')
}
