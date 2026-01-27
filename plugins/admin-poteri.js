let handler = async (m, { conn, args, command }) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null
    if (!who) return

    if (command === 'p' || command === 'promuovi') {
        await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
    } else if (command === 'r' || command === 'retrocedi') {
        await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
    }
}

handler.help = ['promuovi', 'p', 'retrocedi', 'r']
handler.tags = ['admin']
handler.command = ['promuovi', 'p', 'retrocedi', 'r']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler