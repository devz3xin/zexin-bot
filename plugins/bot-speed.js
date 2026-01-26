import { performance } from 'perf_hooks'
import os from 'os'
import { execSync } from 'child_process'

let npmVersion = 'N/A'
try { npmVersion = execSync('npm -v').toString().trim() } catch {}
const nodeVersion = process.version

const handler = async (m, { conn }) => {
    const start = performance.now()
    
    // Info Sistema (Sincrone e istantanee)
    const uptime = formatUptime(process.uptime())
    const { model } = os.cpus()[0]
    const totalMem = (os.totalmem() / 1073741824).toFixed(2)
    const freeMem = (os.freemem() / 1073741824).toFixed(2)
    const usedMem = (totalMem - freeMem).toFixed(2)

    let ssdInfo = 'N/A'
    try {
        ssdInfo = execSync("df -h / | tail -1 | awk '{print $3 \" / \" $2}'").toString().trim()
    } catch {}

    const lattenza = (performance.now() - start).toFixed(3)

    const response = `
*𐙚 SPEED & SERVER INFO*

*🚀 PRESTAZIONI*
➤ Latenza: ${lattenza} ms
➤ Uptime: ${uptime}

*💻 SPECIFICHE SERVER*
➤ Hostname: ${os.hostname()}
➤ OS: ${os.platform()} (${os.arch()})
➤ CPU: ${model}
➤ RAM: ${usedMem}GB / ${totalMem}GB
➤ SSD: ${ssdInfo}

*⚙️ AMBIENTE*
➤ Node.js: ${nodeVersion}
➤ NPM: ${npmVersion}
`.trim()

    await conn.sendMessage(m.key.remoteJid, { 
       text: response, 
        ...global.rcanal(lattenza)
    }, { quoted: m })
}

function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return `${d}g ${h}h ${m}m ${s}s`
}

handler.command = ['speed']
export default handler