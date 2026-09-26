// Optional loopback-only fixture for a real delayed iframe load event.
// Run: node tools/fixtures/iframe-delay-server.mjs. Stop with Ctrl+C.
import http from 'node:http'
import fs from 'node:fs/promises'

const content = await fs.readFile(new URL('./embedded-app.html', import.meta.url))
const timers = new Set()
const server = http.createServer((request, response) => {
  if (request.url !== '/slow.html') { response.writeHead(404); response.end(); return }
  const timer = setTimeout(() => {
    timers.delete(timer)
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
    response.end(content)
  }, 14000)
  timers.add(timer)
  request.on('close', () => { clearTimeout(timer); timers.delete(timer) })
})
server.listen(5192, '127.0.0.1', () => console.log('Delayed iframe fixture: http://127.0.0.1:5192/slow.html (14 seconds)'))
const stop = () => { timers.forEach(clearTimeout); server.closeAllConnections(); server.close(() => process.exit(0)) }
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
