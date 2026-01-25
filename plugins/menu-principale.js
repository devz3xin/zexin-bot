import fs from 'fs';
import { join } from 'path';

let handler = async (m, { conn, usedPrefix, command, args, isOwner }) => {
  const jid = m.chat;
  
  const packageJson = JSON.parse(fs.readFileSync(join(process.cwd(), 'package.json')));
  const botVersion = packageJson.version || '1.0.0';

  let _uptime = process.uptime() * 1000;
  let uptime = clockString(_uptime);

  // Prende utenti registrati correttamente da global.db.users
  let totalUsers = Object.keys(global.db.users || {}).length;

  const fkontak_zexin = {
    key: { participant: '0@s.whatsapp.net', remoteJid: '0@s.whatsapp.net', fromMe: false, id: 'ZexinSystem' },
    message: {
      contactMessage: {
        displayName: `ZEXIN SYSTEM 🛡️`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Zexin;;;\nFN:Zexin\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nEND:VCARD`
      }
    }
  };

  let caption = `
╭───〔 *ZEXIN BOT* 〕───┈
│ 🌸 *Ciao,* @${m.sender.split('@')[0]}
│ 🚀 *Uptime:* ${uptime}
│ 👥 *Utenti:* ${totalUsers}
│ 🤖 *Versione:* ${botVersion}
╰──────────────────┈

Seleziona una categoria qui sotto per visualizzare i comandi disponibili.`.trim();

  const buttons = [
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "🛡️ ADMIN",
        id: `${usedPrefix}funzioni`
      })
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "🎮 GIOCHI",
        id: `${usedPrefix}menu-giochi`
      })
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "📥 DOWNLOAD",
        id: `${usedPrefix}menu-download`
      })
    }
  ];

  const msg = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: {
            title: "ZEXIN MAIN MENU",
            hasVideoMessage: false
          },
          body: { text: caption },
          footer: { text: "Zexin Bot © 2026" },
          nativeFlowMessage: {
            buttons: buttons
          },
          contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            // Rimosso externalAdReply per pulizia estrema e visualizzazione fakecontact
          }
        }
      }
    }
  };

  return await conn.relayMessage(jid, msg, { quoted: fkontak_zexin });
};

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'start', 'help'];

export default handler;