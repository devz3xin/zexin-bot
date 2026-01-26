import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
    const sessionPath = `./${global.authFile}`
    let deletedCount = 0

    try {
        const files = fs.readdirSync(sessionPath)
        
        for (const file of files) {
            if (file === 'creds.json') continue
            const filePath = path.join(sessionPath, file)
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath)
                deletedCount++
            }
        }

        const response = `🉐 ╰┈➤ Sessione pulita: *${deletedCount}* file rimossi\n> Grazie per avermi svuotato! 💮 `

        await conn.sendMessage(m.key.remoteJid, { 
            text: response,
            ...global.newsletter()
        }, { quoted: m })

    } catch (e) {
        console.error(e)
    }
}

handler.command = ['ds']
export default handler