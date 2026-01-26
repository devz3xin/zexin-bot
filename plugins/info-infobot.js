import os from 'os'

let handler = async (m, { conn, participants }) => {
    const uptime = process.uptime()
    const muptime = clockString(uptime * 1000)
    
    const totalUsers = Object.keys(global.db.users).length
    const totalChats = Object.keys(conn.chats || {}).length
    const totalGroups = Object.values(conn.chats || {}).filter(v => v.id.endsWith('@g.us')).length

    const botJid = conn.decodeJid(conn.user.id)
    const botInGroup = participants ? participants.find(u => conn.decodeJid(u.id) === botJid) : null
    const isBotAdmin = botInGroup?.admin === 'admin' || botInGroup?.admin === 'superadmin'

    let info = `⛩️ ╰┈➤ *STATO DI ${global.bot}* 🏮\n\n`
    info += `🉐 *Uptime:* \`${muptime}\`\n`
    info += `🧧 *ID Bot:* \`${botJid}\`\n`
    info += `🛡️ *Admin Gruppo:* ${isBotAdmin ? '✅ SI' : '❌ NO'}\n\n`
    info += `📊 *Statistiche:*\n`
    info += `╰┈➤ 👤 Utenti Database: \`${totalUsers}\`\n`
    info += `╰┈➤ 👥 Gruppi Attivi: \`${totalGroups}\`\n`
    info += `╰┈➤ 💬 Chat Totali: \`${totalChats}\`\n\n`
    info += `💻 *Sistema:*\n`
    info += `╰┈➤ 🔋 RAM: \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`\n`
    info += `╰┈➤ 🏛️ OS: \`${os.platform()}\`\n\n`
    info += `🉐 _Gestito da ${global.creatore}_`

    await conn.sendMessage(m.chat, { 
        text: info,
        ...global.newsletter()
    }, { quoted: m })
}

handler.command = ['infobot', 'botstatus']

export default handler

function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}