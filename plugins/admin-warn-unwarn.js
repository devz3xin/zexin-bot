const handler = async (m, { conn, command, text, isAdmin, isBotAdmin }) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : false
    if (!who) return m.reply(`🏮 ╰┈➤ Tagga o menziona qualcuno`)

    if (!global.db.users[who]) global.db.users[who] = { messages: 0, warns: {} }
    let user = global.db.users[who]
    if (!user.warns) user.warns = {}

    if (command === 'warn') {
        user.warns[m.chat] = (user.warns[m.chat] || 0) + 1

        if (user.warns[m.chat] >= 5) {
            user.warns[m.chat] = 0
            await conn.sendMessage(m.chat, { text: `🉐 ╰┈➤ Utente rimosso per aver raggiunto 5 avvertimenti! 🐉` }, { quoted: m })
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
        } else {
            await conn.sendMessage(m.chat, { 
                text: `⚠️ ╰┈➤ Avvertimento aggiunto! *(${user.warns[m.chat]}/5)* 🏮`,
                ...global.newsletter()
            }, { quoted: m })
        }
    }

    if (command === 'unwarn') {
        if ((user.warns[m.chat] || 0) > 0) {
            user.warns[m.chat] -= 1
            await conn.sendMessage(m.chat, { 
                text: `⛩️ ╰┈➤ Avvertimento rimosso! Rimanenti: *(${user.warns[m.chat]}/5)* 🉐`,
                ...global.newsletter()
            }, { quoted: m })
        } else {
            m.reply(`🏮 ╰┈➤ L'utente non ha avvertimenti in questo gruppo`)
        }
    }
}

handler.command = ['warn', 'unwarn']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler