import { writeFileSync } from 'fs';
import print from './lib/print.js';

export default async function handler(conn, m) {
    try {
        if (!m.message) return;

        const jid = conn.decodeJid(m.key.remoteJid);
        const isGroup = jid.endsWith('@g.us');
        const sender = conn.decodeJid(m.key.participant || jid);

        m.chat = jid;
        m.sender = sender;
        
        // Rilevamento dinamico del tipo di messaggio
        m.mtype = Object.keys(m.message)[0];
        if (m.mtype === 'messageContextInfo') {
            m.message = m.message.listResponseMessage || m.message.buttonsResponseMessage || m.message;
            m.mtype = Object.keys(m.message)[0];
        }
        m.msg = m.message[m.mtype];

        // Estrazione testo da OGNI tipo di bottone
        let text = "";
        if (m.mtype === 'conversation') text = m.message.conversation;
        else if (m.mtype === 'extendedTextMessage') text = m.message.extendedTextMessage.text;
        else if (m.mtype === 'buttonsResponseMessage') text = m.message.buttonsResponseMessage.selectedButtonId;
        else if (m.mtype === 'listResponseMessage') text = m.message.listResponseMessage.singleSelectReply.selectedRowId;
        else if (m.mtype === 'templateButtonReplyMessage') text = m.message.templateButtonReplyMessage.selectedId;
        else if (m.mtype === 'interactiveResponseMessage') {
            const paramsJson = m.message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson;
            if (paramsJson) {
                const params = JSON.parse(paramsJson);
                text = params.id || params.text || "";
            }
        } else if (m.msg?.selectedId) text = m.msg.selectedId;
        else if (m.msg?.text) text = m.msg.text;

        m.text = text || "";

        // Database
        global.db.users = global.db.users || {};
        global.db.groups = global.db.groups || {};

        if (!global.db.users[sender]) global.db.users[sender] = { messages: 0 };
        global.db.users[sender].messages++;

        if (isGroup) {
            if (!global.db.groups[jid]) {
                global.db.groups[jid] = { messages: 0, rileva: false, welcome: true, antilink: true };
            }
            global.db.groups[jid].messages++;
        }
        writeFileSync('./database.json', JSON.stringify(global.db, null, 2));

        await print(m, conn);

        if (m.key.fromMe) return;

        const prefix = global.prefix instanceof RegExp ? (global.prefix.test(m.text) ? m.text.match(global.prefix)[0] : '.') : (global.prefix || '.');
        if (!m.text.startsWith(prefix)) return;

        const args = m.text.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const fullText = args.join(' '); 

        const isOwner = global.owner.some(o => o[0] === sender.split('@')[0]);
        const groupMetadata = isGroup ? await conn.groupMetadata(jid).catch(() => ({})) : {};
        const participants = isGroup ? (groupMetadata.participants || []) : [];
        const user = isGroup ? participants.find(u => conn.decodeJid(u.id) === sender) : {};
        const bot = isGroup ? participants.find(u => conn.decodeJid(u.id) === conn.decodeJid(conn.user.id)) : {};
        const isAdmin = user?.admin === 'admin' || user?.admin === 'superadmin' || isOwner;
        const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin';

        for (let name in global.plugins) {
            let plugin = global.plugins[name];
            if (!plugin || plugin.disabled) continue;

            const isAccept = Array.isArray(plugin.command) ? 
                plugin.command.includes(command) : 
                (plugin.command instanceof RegExp ? plugin.command.test(command) : plugin.command === command);

            if (isAccept) {
                try {
                    await plugin.call(conn, m, {
                        conn, args, text: fullText, usedPrefix: prefix, command, isOwner, isAdmin, isBotAdmin, participants, groupMetadata
                    });
                } catch (e) {
                    console.error(e);
                }
                break;
            }
        }
    } catch (e) {
        console.error(e);
    }
}