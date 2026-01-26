import pkg from "@realvare/based";
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = pkg;
import pino from "pino";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import qrcode from "qrcode-terminal";
import { pathToFileURL } from 'url';
import chokidar from 'chokidar';
import handler from "./handler.js";
import './config.js';

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(`./${global.authFile}`);
    const { version } = await fetchLatestBaileysVersion();

    const printHeader = () => {
        console.clear();
        console.log(chalk.magenta(`
███████╗███████╗██╗  ██╗██╗███╗   ██╗    ██████╗  ██████╗ ████████╗
╚══███╔╝██╔════╝╚██╗██╔╝██║████╗  ██║    ██╔══██╗██╔═══██╗╚══██╔══╝
  ███╔╝ █████╗   ╚███╔╝ ██║██╔██╗ ██║    ██████╔╝██║   ██║   ██║   
 ███╔╝  ██╔══╝   ██╔██╗ ██║██║╚██╗██║    ██╔══██╗██║   ██║   ██║   
███████╗███████╗██╔╝ ██╗██║██║ ╚████║    ██████╔╝╚██████╔╝   ██║   
╚══════╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝    ╚═════╝  ╚═════╝    ╚═╝   `));
        console.log(chalk.cyan(`\n[ AVVIO ] 🌸 Benvenuto in ZexinBot! Avvio in corso...`));
    };

    printHeader();

    const conn = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ['Zexin-Bot', 'Safari', '3.0']
    });

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
        return global.db.data?.users?.[id]?.name || id.split('@')[0];
    };

    global.db = { data: { users: {}, groups: {}, chats: {}, settings: {} } };
    if (fs.existsSync('./database.json')) {
        try {
            const dbRaw = JSON.parse(fs.readFileSync('./database.json'));
            global.db.data = dbRaw.data || dbRaw;
        } catch (e) {
            console.error(chalk.red('[DB ERROR]'), e);
        }
    }

    global.plugins = {};
    const pluginsFolder = path.join(process.cwd(), 'plugins');
    const loadPlugins = async () => {
        const pluginFiles = fs.readdirSync(pluginsFolder).filter(file => file.endsWith('.js'));
        for (let file of pluginFiles) {
            try {
                const pluginPath = pathToFileURL(path.join(pluginsFolder, file)).href;
                const plugin = await import(`${pluginPath}?update=${Date.now()}`);
                global.plugins[file] = plugin.default || plugin;
            } catch (e) {}
        }
    };
    await loadPlugins();

    const watcher = chokidar.watch(['plugins/', 'handler.js', 'config.js', 'lib/'], {
        persistent: true,
        ignoreInitial: true
    });

    watcher.on('change', async (filePath) => {
        const fileName = path.basename(filePath);
        const fileUrl = pathToFileURL(path.resolve(filePath)).href;
        if (filePath.includes('plugins/')) {
            const plugin = await import(`${fileUrl}?update=${Date.now()}`);
            global.plugins[fileName] = plugin.default || plugin;
        } else if (fileName === 'handler.js' || fileName === 'config.js') {
            await import(`${fileUrl}?update=${Date.now()}`);
        }
    });

    conn.ev.on('creds.update', saveCreds);
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            printHeader();
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'open') {
            printHeader();
            console.log(chalk.green.bold('\n[ SUCCESS ] ') + chalk.white('Zexin Online 🌸\n'));
        }
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.code;
            if (reason !== DisconnectReason.loggedOut) {
                process.exit(1); 
            }
        }
    });

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        if (!chatUpdate.messages || !chatUpdate.messages[0]) return;
        const m = chatUpdate.messages[0];
        if (m.key.fromMe) return;
        await handler(conn, m);
    });
    
    return conn;
}

startBot();