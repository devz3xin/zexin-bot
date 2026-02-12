import { exec } from 'child_process'
import os from 'os'
import fs from 'fs'
import { promisify } from 'util'

const execPromise = promisify(exec)

const handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return
    
    const hostname = os.hostname()
    if (hostname.startsWith('codespaces')) {
        return m.reply(`🚫 ╰┈➤ Comando disabilitato su Codespaces per evitare conflitti di sincronizzazione.`)
    }

    await conn.sendPresenceUpdate('composing', m.chat)
    
    try {
        await m.reply(`🔄 ╰┈➤ Inizio aggiornamento plugin...`)
        
        if (fs.existsSync('./plugins')) {
            fs.rmSync('./plugins', { recursive: true, force: true })
        }

        const gitUrl = 'https://github.com/tuo-username/tuo-repo.git'
        
        await execPromise(`git clone ${gitUrl} temp_plugins && cp -r temp_plugins/plugins/* ./plugins/ && rm -rf temp_plugins`)

        await m.reply(`✅ ╰┈➤ Plugin aggiornati con successo da Git!\n\n*Hostname:* \`${hostname}\`\n*Stato:* \`Sincronizzato\` 🐉`)

    } catch (e) {
        console.error(e)
        await m.reply(`❌ ╰┈➤ Errore durante l'aggiornamento:\n\n${e.message}`)
    }
}

handler.command = ['aggiorna', 'update']
handler.owner = true

export default handler