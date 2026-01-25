const handler = async (m, { conn, isOwner, isAdmin }) => {
    const sender = conn.decodeJid(m.key.participant || m.key.remoteJid)
    const text = `
────୨ৎ────
*𐙚 STATUS*

➤ *Owner:* ${isOwner ? '✅' : '❌'}
➤ *Admin:* ${isAdmin ? '✅' : '❌'}
➤ *JID:* \`${sender}\`

. ܁₊ ⊹ . ܁ ⟡ ܁ . ⊹ ₊ ܁.
`.trim()

    await conn.sendMessage(m.key.remoteJid, { text, ...global.rcanal() }, { quoted: m })
}
handler.command = ['test']
handler.owner = true
export default handler