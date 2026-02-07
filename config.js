import fs from 'fs'
import chalk from 'chalk'

global.bot = '𐙚 𝗭𝗘𝗫𝗜𝗡 𝗕𝗢𝗧'
global.creatore = '⋆˚꩜ 𝗭𝗘𝗫𝗜𝗡'

global.owner = [['212614769337', 'Zexin']]
global.authFile = 'zexin-session'
global.prefix = /^[./!#]/


/* inserisci le tue API Key al posto di zexin-bot
 per far si che funzionino i comandi associati */

global.APIKeys = {
    gemini: 'AIzaSyBubq2rVXytLCNHS1XfL2KEnVbxFeTowY0',
    removebg: 'zexin-bot',
    browserless: '2TDow7lMALC87LE35e274ea10fa93aac4a166e010942ab262',
    lastfm: '2eb5ad17c8803c188abc8e301309875e',
    chatgpt: 'f930fa4bc0msh24fdb884d5f857dp19dbf6jsn817ac0159619',
    openrouter: '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'
}

global.immagini = [
    'https://i.ibb.co/hxC1T34f/damn17.jpg',
    'https://i.ibb.co/fY7W4VZK/ghost17.jpg',
    'https://i.ibb.co/YBG5bywX/nochalante17.jpg',
    'https://i.ibb.co/QvBshB7n/shit17.jpg',
    'https://i.ibb.co/35c7M44F/hurt17.jpg',
    'https://i.ibb.co/Gwbg90w/idk17.jpg',
    'https://i.ibb.co/F4nY0zW8/lifeismusic17.jpg',
    'https://i.ibb.co/NnJbKYhQ/lifenosrs17.jpg',
    'https://i.ibb.co/VWLrC5J6/love17.jpg',
    'https://i.ibb.co/S4McqR4g/normalize17.jpg',
    'https://i.ibb.co/MKPTbMM/redflag.jpg'
]

global.canale = {
    id: '120363418582531215@newsletter',
    nome: '⋆. 𐙚˚࿔ zexinbot 𝜗𝜚˚⋆',
    link: 'https://whatsapp.com/channel/0029VbB41Sa1Hsq1JhsC1Z1z'
}

global.fakecontact = (m) => {
    return {
        key: { 
            participant: '0@s.whatsapp.net', 
            remoteJid: '0@s.whatsapp.net', 
            fromMe: false, 
            id: 'ZexinSystem' 
        },
        message: {
            contactMessage: {
                displayName: `𐙚 𝗭𝗘𝗫𝗜𝗡 𝗕𝗢𝗧`,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Zexin;;;\nFN:Zexin\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nEND:VCARD`
            }
        }
    }
}

global.rcanal = (speed = '') => {
    const foto = global.immagini[Math.floor(Math.random() * global.immagini.length)]
    return {
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.canale.id,
                serverMessageId: 1,
                newsletterName: global.canale.nome
            },
            externalAdReply: {
                title: global.bot,
                body: speed ? `Lattenza: ${speed}ms` : global.creatore,
                thumbnailUrl: foto,
                sourceUrl: global.canale.link,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    }
}

global.newsletter = () => {
    return {
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.canale.id,
                serverMessageId: 1,
                newsletterName: global.canale.nome
            },
        }
    }
}

global.dfail = async (type, m, conn) => {
    const msg = {
        owner: '`𐔌👑꒱` _*Solo il proprietario del bot può usare questo comando!*_',
        admin: '`𐔌🛡️ ꒱` _*Solo gli amministratori del gruppo possono usare questo comando!*_',
        group: '`𐔌👥 ꒱` _*Questo comando può essere usato solo in chat di gruppo!*_',
        private: '`𐔌📩 ꒱` _*Questo comando può essere usato solo in chat privata!*_',
        disabled: '`𐔌🔒 ꒱` _*Questo comando è stato disattivato dall\'owner!*_',
        botAdmin: '`𐔌🤖 ꒱` _*Devo essere amministratore per eseguire questo comando!*_'
    }[type]

    if (msg) {
        return conn.sendMessage(m.chat, {
            text: msg,
            ...global.newsletter()
        }, { quoted: m })
    }
}