let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return global.dfail('owner', m, conn)

    await m.reply('⛩️ ╰┈➤ *Sincronizzazione in corso...* 🏮')

    try {
        const getGroups = await conn.groupFetchAllParticipating()
        const groups = Object.values(getGroups)
        
        for (let group of groups) {
            if (!global.db.groups[group.id]) {
                global.db.groups[group.id] = { 
                    messages: 0, 
                    rileva: false, 
                    welcome: true, 
                    antilink: true 
                }
            }
        }

        let info = `✅ ╰┈➤ *Sincronizzazione completata!*\n\n`
        info += `🏮 *Gruppi rilevati:* \`${groups.length}\`\n`
        info += `🛡️ *Stato Admin:* Aggiornato\n`
        info += `🉐 *Database:* Sincronizzato\n\n`
        info += `🧧 _Ora i controlli isBotAdmin dovrebbero funzionare correttamente._`

        await conn.sendMessage(m.chat, { 
            text: info,
            ...global.newsletter()
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('❌ ╰┈➤ Errore durante il refresh dei metadati.')
    }
}

handler.command = ['refresh', 'sincronizza', 'ref']
handler.owner = true 

export default handler