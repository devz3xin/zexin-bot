const handler = async (m, { conn, command, text }) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : false

    if (!who && text) {
        let jid = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        who = jid
    }

    if (!who) return m.reply(`🏮 ╰┈➤ Tagga o menziona qualcuno`)

    who = conn.decodeJid(who)

    if (who.includes('lid') || (who.split('@')[0].length > 13)) {
        let userInDb = Object.keys(global.db.data.users).find(key => key.includes(who.split('@')[0]))
        if (userInDb) who = userInDb
    }

    if (!global.db.data.users[who]) global.db.data.users[who] = { warns: {} }
    let user = global.db.data.users[who]
    
    if (!user.warns || Array.isArray(user.warns)) user.warns = {}

    const chatTag = m.chat.split('@')[0]

    if (command === 'warn') {
        let reason = text ? text.replace(/@\d+/g, '').trim() : 'Nessun motivo specificato'
        let warnId = Date.now().toString()
        
        user.warns[warnId] = {
            reason: reason,
            group: m.chat,
            date: new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }),
            by: m.sender
        }

        let totalWarns = Object.keys(user.warns).length
        let groupWarns = Object.values(user.warns).filter(w => w.group === m.chat).length

        if (groupWarns >= 5) {
            Object.keys(user.warns).forEach(id => {
                if (user.warns[id].group === m.chat) delete user.warns[id]
            })
            
            await conn.sendMessage(m.chat, { 
                text: `🉐 ╰┈➤ Utente *@${who.split('@')[0]}* rimosso per aver raggiunto 5 avvertimenti in questo gruppo! 🐉`,
                mentions: [who]
            }, { quoted: m })
            
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove').catch(e => console.error("Errore Kick:", e))
            
        } else {
            await conn.sendMessage(m.chat, { 
                text: `⚠️ ╰┈➤ *@${who.split('@')[0]}* ha ricevuto un avvertimento!\n\n┆ \`motivo\` ─ ${reason}\n╰┈➤ \`totali\` ─ *${groupWarns}*/5 🏮`,
                mentions: [who],
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.canale.id,
                        newsletterName: global.canale.nome
                    }
                }
            }, { quoted: m })
        }
    }

    if (command === 'unwarn') {
        let userWarnKeys = Object.keys(user.warns).filter(id => user.warns[id].group === m.chat)

        if (userWarnKeys.length > 0) {
            let lastWarnId = userWarnKeys.sort().pop()
            delete user.warns[lastWarnId]
            
            let groupWarns = Object.values(user.warns).filter(w => w.group === m.chat).length

            await conn.sendMessage(m.chat, { 
                text: `⛩️ ╰┈➤ Avvertimento rimosso a *@${who.split('@')[0]}*!\n╰┈➤ \`warn rimasti\` ─ *(${groupWarns}/5)* 🉐`,
                mentions: [who],
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.canale.id,
                        newsletterName: global.canale.nome
                    }
                }
            }, { quoted: m })
        } else {
            m.reply(`🏮 ╰┈➤ *@${who.split('@')[0]}* non ha avvertimenti attivi in questo gruppo`, null, { mentions: [who] })
        }
    }
}

handler.command = ['warn', 'unwarn']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler