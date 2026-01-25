import chalk from 'chalk'

export async function groupUpdate(conn, anu) {
    try {
        const { id, participants, action, author } = anu
        
        if (!global.db || !global.db.data) return
        
        const chat = global.db.data.chats?.[id] || global.db.groups?.[id]
        
        if (!chat || (!chat.rileva && !chat.monitoraggio)) {
            return
        }

        const user = participants[0]
        const from = author || id 
        
        let displayName = action === 'promote' ? `🎋 PROMOZIONE` : `🎐 RETROCESSIONE`

        const fakeContact = {
            key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
            message: {
                contactMessage: {
                    displayName: `${displayName}`,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;User;;;\nFN:User\nitem1.TEL;waid=${user.split('@')[0]}:${user.split('@')[0]}\nitem1.X-ABLabel:PSTN\nEND:VCARD`
                }
            }
        }

        let testo = action === 'promote' 
            ? `@${user.split('@')[0]} è ora un amministratore.`
            : `@${user.split('@')[0]} non è più amministratore.`

        await conn.sendMessage(id, { 
            text: testo, 
            mentions: [from, user],
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363303102327657@newsletter',
                    newsletterName: 'Zexin Updates 🪷'
                }
            }
        }, { quoted: fakeContact })

    } catch (e) {
        console.error(chalk.red('[Errore Funzione Permessi]:'), e)
    }
}