import pkg from "@realvare/based";
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = pkg;
import pino from "pino";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { pathToFileURL } from 'url';
import handler from "./handler.js";
import printMessage from './lib/print.js';
import { groupUpdate } from './funzioni/permessi.js';
import './config.js';

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(`./${global.authFile}`);
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: ['Zexin Bot', 'Safari', '3.0']
    });

    global.db = { data: { users: {}, groups: {}, chats: {}, settings: {} } };
    if (fs.existsSync('./database.json')) {
        try {
            const dbRaw = JSON.parse(fs.readFileSync('./database.json'));
            global.db.data = dbRaw.data || dbRaw;
        } catch (e) {
            console.error(chalk.red('[DB ERROR]'), e);
        }
    }

    setInterval(() => {
        fs.writeFileSync('./database.json', JSON.stringify(global.db, null, 2));
    }, 10000);

    global.plugins = {};
    const pluginsFolder = path.join(process.cwd(), 'plugins');
    const pluginFiles = fs.readdirSync(pluginsFolder).filter(file => file.endsWith('.js'));
    
    for (let file of pluginFiles) {
        try {
            const pluginPath = pathToFileURL(path.join(pluginsFolder, file)).href;
            const plugin = await import(pluginPath);
            global.plugins[file] = plugin.default || plugin;
        } catch (e) {}
    }

    conn.ev.on('creds.update', saveCreds);

    conn.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jid.split(':');
            return decode[0] + '@' + decode[1].split('@')[1];
        }
        return jid;
    };

    conn.getName = async (jid) => {
        let id = conn.decodeJid(jid);
        if (id.endsWith('@g.us')) {
            const metadata = await conn.groupMetadata(id).catch(() => ({ subject: id }));
            return metadata.subject || id;
        }
        return global.db.data.users?.[id]?.name || id.split('@')[0];
    };

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        if (!chatUpdate.messages || !chatUpdate.messages[0]) return;
        const m = chatUpdate.messages[0];
        if (m.key.fromMe) return; 
        await printMessage(m, conn);
        await handler(conn, m);
    });

    conn.ev.on('group-participants.update', async (anu) => {
        await printMessage(anu, conn, true);
        console.log(JSON.stringify(anu, null, 2));
        await groupUpdate(conn, anu);
    });

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') console.log(chalk.green.bold('\n[ SUCCESS ] ') + chalk.white('Zexin Online 🌸\n'));
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startBot();
        }
    });

    return conn;
}
startBot();