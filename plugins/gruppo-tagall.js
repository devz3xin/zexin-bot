const handler = async (m, { conn, participants, args }) => {
    const messaggio = args.join(' ')
    const info = messaggio ? `»『 📢 』 *MESSAGGIO:* ${messaggio}` : ''
    let tagall = `*─ׄ─ׅ─ׄ『 .𖥔 ݁ ˖🌍── .✦ 』─ׄ─ׅ─ׄ*\n\n${info ? info + '\n' : ''}\n╭  ┄ 𝅄  ۪꒰ 𐙚 ${global.bot} ꒱  ۟   𝅄 ┄\n`
    
    for (let mem of participants) {
        tagall += `┃ ➤ @${mem.id.split('@')[0]}\n`
    }
    
    tagall += `╰⸼ ┄ ┄꒰  ׅ୭ *tagall* ୧ ׅ ꒱─ ┄ ⸼`

    await conn.sendMessage(m.chat, { 
        text: tagall,
        mentions: participants.map(a => a.id),
        ...global.rcanal()
    }, { quoted: m })
}

handler.command = ['tagall', 'tutti']
handler.admin = true
handler.group = true
export default handler