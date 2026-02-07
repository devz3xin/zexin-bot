import { writeFileSync } from 'fs';

/**
 * 
 * @param {Object} m 
 * @param {Object} extra 
 */

export async function antilink(m, { conn, isAdmin, isBotAdmin, users }) {
    if (!m.text || isAdmin || !isBotAdmin) return false;

    const linkRegex = /https?:\/\/[^\s]+/i;
    
    if (linkRegex.test(m.text)) {
        const jid = m.chat;
        const sender = m.sender;

        await conn.sendMessage(jid, { delete: m.key });

        if (!users[sender].warns) users[sender].warns = {};
        if (!users[sender].warns[jid]) users[sender].warns[jid] = 0;

        users[sender].warns[jid] += 1;
        const count = users[sender].warns[jid];

        await conn.sendMessage(jid, {
            text: `⚠️ *Link Rilevato!* ⚠️\n\n@${sender.split('@')[0]}, i link non sono ammessi.\n*Warn:* ${count}/3`,
            mentions: [sender]
        }, { quoted: m });

        if (count >= 5) {
            await conn.groupParticipantsUpdate(jid, [sender], 'remove');
            users[sender].warns[jid] = 0;
            await conn.sendMessage(jid, { text: `🚫 Utente rimosso per limite avvertimenti raggiunto.` });
        }

        writeFileSync('./database.json', JSON.stringify(global.db.data, null, 2));
        
        return true; 
    }

    return false;
}