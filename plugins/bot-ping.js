import { performance } from 'perf_hooks'

const handler = async (m, { conn }) => {
    const start = performance.now()
    const end = performance.now()
    const lattenza = (end - start).toFixed(3)
    
    const response = `
────୨ৎ────
*𐙚 PING*
➤ \`${lattenza} ms\`
. ܁₊ ⊹ . ܁ ⟡ ܁ . ⊹ ₊ ܁.
`.trim()

    await conn.sendMessage(m.key.remoteJid, { 
        text: response, 
        ...global.rcanal(lattenza)
    }, { quoted: m })
}

handler.command = ['ping']
handler.restricted = true
export default handler