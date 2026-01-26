import fetch from 'node-fetch'
import fs from 'fs'

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin }) => {
    const jid = m.chat
    const userName = m.pushName || 'Utente'

    let groupPfp
    try {
        groupPfp = await conn.profilePictureUrl(jid, 'image')
    } catch (e) {
        groupPfp = 'https://i.ibb.co/kVdFLyGL/sam.jpg' 
    }

    const fkontak_zexin = {
        key: { participant: '0@s.whatsapp.net', remoteJid: '0@s.whatsapp.net', fromMe: false, id: 'ZexinSystem' },
        message: {
            contactMessage: {
                displayName: `ZEXIN SYSTEM 🛡️`,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Zexin;;;\nFN:Zexin\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nEND:VCARD`
            }
        }
    }

    if (!args.length || command === 'funzioni') {
        const adminFeatures = [
            { key: 'rileva', name: '📡 Monitoraggio', desc: 'Rileva eventi e modifiche nel gruppo.' },
            { key: 'welcome', name: 'Benvenuto', desc: 'Invia un messaggio ai nuovi membri.' },
            { key: 'antilink', name: 'Protezione Link', desc: 'Rimuove link di inviti esterni.' }
        ]

        const cards = adminFeatures.map(f => ({
            header: {
                imageMessage: groupPfp,
                hasVideoMessage: false,
            },
            body: { 
                text: `*MODULO:* ${f.name}\n*INFO:* ${f.desc}\n\n*Comando da scrivere:*\n\`${usedPrefix}attiva ${f.key}\`\n\`${usedPrefix}disattiva ${f.key}\`` 
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: `ATTIVA ${f.key.toUpperCase()}`,
                            id: `${usedPrefix}attiva ${f.key}`
                        })
                    }
                ]
            }
        }))

        const msg = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: `*PANNELLO ADMIN ZEXIN-BOT*\n\nCiao ${userName}, scorri le schede per gestire le impostazioni del gruppo.` },
                        carouselMessage: {
                            cards: cards
                        },
                        ...global.newsletter().contextInfo
                    }
                }
            }
        }

        return await conn.relayMessage(jid, msg, { quoted: fkontak_zexin })
    }

    let isEnable = /attiva|on|1/i.test(command)
    if (/disattiva|off|0/i.test(command)) isEnable = false

    global.db.data.chats[jid] = global.db.data.chats[jid] || { rileva: false, welcome: true, antilink: true }
    let settings = global.db.data.chats[jid]

    const type = args[0].toLowerCase()
    let featureName = ""

    switch (type) {
        case 'rileva':
        case 'rivela':
            settings.rileva = isEnable
            featureName = 'Monitoraggio'
            break
        case 'welcome':
            settings.welcome = isEnable
            featureName = 'Benvenuto'
            break
        case 'antilink':
            settings.antilink = isEnable
            featureName = 'Antilink'
            break
        default:
            return m.reply(`🏮 ╰┈➤ Modulo non trovato. Usa \`${usedPrefix}funzioni\``)
    }

    let confText = `🏮 *Funzione:* \`${featureName}\`\n` +
                   `🧧 *Stato:* ${isEnable ? '🟢 ATTIVATA' : '🔴 DISATTIVATA'}`
    await conn.sendMessage(jid, { 
        text: confText, 
        mentions: [m.sender],
        ...global.newsletter()
    }, { quoted: fkontak_zexin })
}

handler.help = ['funzioni', 'attiva', 'disattiva']
handler.tags = ['admin']
handler.command = ['funzioni', 'attiva', 'disattiva']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler