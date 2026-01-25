const handler = async (m, { conn }) => {
    const jid = m.key.remoteJid
    if (!jid.endsWith('@g.us')) return global.dfail('group', m, conn)

    const groupMetadata = await conn.groupMetadata(jid)
    const participants = groupMetadata.participants || []
    const admins = participants.filter(p => p.admin !== null)

    let text = `────୨ৎ────\n*𐙚 LISTA ADMIN*\n\n`
    let mentions = []

    for (let admin of admins) {
        const decodedJid = conn.decodeJid(admin.id)
        const number = decodedJid.split('@')[0]
        text += `➤ *Numero:* ${number}\n`
        text += `➤ *JID:* \`${decodedJid}\`\n`
        text += `➤ *Tag:* @${number}\n\n`
        mentions.push(decodedJid)
    }

    text += `. ܁₊ ⊹ . ܁ ⟡ ܁ . ⊹ ₊ ܁.`

    await conn.sendMessage(jid, { 
        text: text.trim(), 
        mentions,
        ...global.rcanal()
    }, { quoted: m })
}

handler.command = ['admin', 'admins']
handler.group = true
export default handler