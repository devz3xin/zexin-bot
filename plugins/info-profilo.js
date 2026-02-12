import axios from 'axios'
import fs from 'fs'
import { join } from 'path'
import PhoneNumber from 'awesome-phonenumber'

const BROWSERLESS_KEY = global.APIKeys?.browserless
const LASTFM_API_KEY = global.APIKeys?.lastfm
const tmpDir = './media/tmp/info'
const defCover = 'https://i.ibb.co/hJW7WwxV/varebot.jpg'

const getDevice = (m) => {
    const id = m.key.id
    if (id.length > 21) return 'Android'
    if (id.substring(0, 2) === '3A') return 'iOS'
    if (id.length < 20) return 'Desktop / Web'
    return 'WhatsApp'
}

async function apiCall(method, params) {
    try {
        const query = new URLSearchParams({ method, api_key: LASTFM_API_KEY, format: 'json', ...params })
        const res = await axios.get(`https://ws.audioscrobbler.com/2.0/?${query}`, { timeout: 5000 })
        return res.data
    } catch { return {} }
}

async function fetchCover(lastFmImages, query) {
    let cover = lastFmImages?.find(i => i.size === 'extralarge')?.['#text']
    if (cover && cover.trim() !== '' && !cover.includes('2a96cbd8b46e442fc41c2b86b821562f')) return cover
    try {
        const { data } = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=1&media=music`)
        if (data.results?.[0]?.artworkUrl100) return data.results[0].artworkUrl100.replace('100x100bb', '600x600bb')
    } catch {}
    return defCover
}

const handler = async (m, { conn, usedPrefix }) => {
    const device = getDevice(m)
    const jid = m.sender
    const number = jid.split('@')[0]
    const nomeUtente = m.pushName || (conn.getName ? await conn.getName(jid) : number)
    const formattedNumber = PhoneNumber('+' + number).getNumber('international')
    const role = m.userRole || 'MEMBRO'
    
    const usersDb = global.db.data.users || {}
    const userData = usersDb[jid] || {}
    let userMsgs = userData.messages || 0
    let warnsCount = userData.warns ? Object.keys(userData.warns).length : 0
    const allUsers = Object.entries(usersDb).filter(([id, data]) => (id.endsWith('@s.whatsapp.net') || id.endsWith('@lid')) && (data.messages > 0)).sort((a, b) => (b[1].messages || 0) - (a[1].messages || 0))
    const rankIndex = allUsers.findIndex(([id]) => id === jid || id === m.senderLid)
    const globalRank = rankIndex !== -1 ? rankIndex + 1 : 'N/A'

    const captionProfilo = `╭┈  『 👤 』 \`${nomeUtente}\`\n┆  『 💬 』 \`statistiche\`\n┆  ╰➤  \`messaggi\` ─ *${userMsgs}*\n┆  ╰➤  \`warns\` ─ *${warnsCount}*\n┆  ╰➤  \`rank\` ─ *#${globalRank}*\n╰┈➤ 『 📦 』 \`declare system\``

    let pfp
    try {
        pfp = await conn.profilePictureUrl(jid, 'image')
    } catch {
        pfp = 'https://i.ibb.co/Gwbg90w/idk17.jpg'
    }

    if (device === 'iOS') {
        return await conn.sendMessage(m.chat, { image: { url: pfp }, caption: captionProfilo, mentions: [jid] }, { quoted: m })
    }

    await conn.sendPresenceUpdate('composing', m.chat)
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const htmlProfilo = `<html><head><style>
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;700;900&display=swap');
        body { margin: 0; padding: 0; width: 1280px; height: 780px; display: flex; align-items: center; justify-content: center; font-family: 'Figtree', sans-serif; background: #000; overflow: hidden; }
        .bg { position: absolute; width: 100%; height: 100%; background: url('${pfp}') center/cover; filter: blur(70px) brightness(0.35); transform: scale(1.1); }
        .container { position: relative; width: 1100px; height: 550px; background: rgba(255, 255, 255, 0.04); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 70px; display: flex; align-items: center; justify-content: center; padding: 60px; box-sizing: border-box; }
        .pfp-square { width: 380px; height: 380px; border-radius: 50px; border: 1px solid rgba(255,255,255,0.2); background: url('${pfp}') center/cover; box-shadow: 0 30px 60px rgba(0,0,0,0.6); flex-shrink: 0; }
        .info { margin-left: 70px; color: white; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; }
        .name { font-size: 65px; font-weight: 900; margin-bottom: 8px; color: #fff; text-transform: uppercase; letter-spacing: -2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 550px; }
        .role-tag { display: inline-block; background: rgba(0,212,255,0.2); padding: 8px 22px; border-radius: 18px; font-size: 22px; font-weight: 800; margin-bottom: 25px; color: #00d4ff; text-transform: uppercase; letter-spacing: 2px; width: fit-content; }
        .number { font-size: 28px; color: rgba(255,255,255,0.6); margin-bottom: 40px; font-weight: 700; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .stat-card { background: rgba(255,255,255,0.08); padding: 22px 30px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.1); }
        .stat-label { font-size: 14px; text-transform: uppercase; color: rgba(255,255,255,0.5); font-weight: 800; letter-spacing: 2px; margin-bottom: 6px; }
        .stat-value { font-size: 32px; font-weight: 900; color: #fff; }
    </style></head><body>
        <div class="bg"></div>
        <div class="container">
            <div class="pfp-square"></div>
            <div class="info">
                <div class="name">${nomeUtente}</div>
                <div class="role-tag">${role}</div>
                <div class="number">${formattedNumber}</div>
                <div class="grid">
                    <div class="stat-card"><div class="stat-label">Messaggi</div><div class="stat-value">${userMsgs}</div></div>
                    <div class="stat-card"><div class="stat-label">Warns</div><div class="stat-value">${warnsCount}</div></div>
                    <div class="stat-card"><div class="stat-label">Rank</div><div class="stat-value">#${globalRank}</div></div>
                    <div class="stat-card"><div class="stat-label">Device</div><div class="stat-value">${device}</div></div>
                </div>
            </div>
        </div>
    </body></html>`

    try {
        const ssProfilo = await axios.post(`https://chrome.browserless.io/screenshot?token=${BROWSERLESS_KEY}`, {
            html: htmlProfilo,
            options: { type: 'jpeg', quality: 95 },
            viewport: { width: 1280, height: 780 }
        }, { responseType: 'arraybuffer' })

        const fileProfilo = join(tmpDir, `p_${Date.now()}.jpg`)
        fs.writeFileSync(fileProfilo, Buffer.from(ssProfilo.data))

        let cards = []
        cards.push({
            image: { url: fileProfilo },
            body: captionProfilo,
            buttons: [
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📊 Top Messaggi', id: `${usedPrefix}topmessaggi` }) }
            ]
        })

        let lfmDb = {}
        if (fs.existsSync('./media/lastfm.json')) lfmDb = JSON.parse(fs.readFileSync('./media/lastfm.json', 'utf-8') || '{}')
        const lfmUser = lfmDb[jid] || lfmDb[number]

        if (lfmUser) {
            const res = await apiCall('user.getrecenttracks', { user: lfmUser, limit: 1 })
            const track = res.recenttracks?.track?.[0]
            if (track && track['@attr']?.nowplaying === 'true') {
                const cover = await fetchCover(track.image, `${track.artist['#text']} ${track.name}`)
                const trackInfo = await apiCall('track.getInfo', { artist: track.artist['#text'], track: track.name, user: lfmUser })
                const playcount = trackInfo?.track?.userplaycount || 0

                const htmlMusica = `<html><head><style>
                    body { margin: 0; padding: 0; width: 1280px; height: 780px; display: flex; align-items: center; justify-content: center; background: #000; overflow: hidden; }
                    .bg { position: absolute; width: 100%; height: 100%; background: url('${cover}') center/cover; filter: blur(80px) brightness(0.4); transform: scale(1.2); }
                    .art { position: relative; width: 550px; height: 550px; border-radius: 50px; box-shadow: 0 40px 100px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.2); }
                </style></head><body>
                    <div class="bg"></div>
                    <img class="art" src="${cover}">
                </body></html>`

                const ssMusica = await axios.post(`https://chrome.browserless.io/screenshot?token=${BROWSERLESS_KEY}`, {
                    html: htmlMusica,
                    options: { type: 'jpeg', quality: 95 },
                    viewport: { width: 1280, height: 780 }
                }, { responseType: 'arraybuffer' })

                const fileMusica = join(tmpDir, `m_${Date.now()}.jpg`)
                fs.writeFileSync(fileMusica, Buffer.from(ssMusica.data))

                cards.push({
                    image: { url: fileMusica },
                    body: `╭┈  『 👤 』 \`utente\` ─ ${lfmUser}\n┆  『 🎵 』 \`brano\` ─ *${track.name}*\n┆  『 👤 』 \`artista\` ─ *${track.artist['#text']}*\n┆  『 📊 』 \`ascolti\` ─ *${playcount}*\n╰┈➤ 『 📦 』 \`declare system\``,
                    buttons: [
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📥 Scarica Audio', id: `${usedPrefix}play ${track.name} ${track.artist['#text']}` }) }
                    ]
                })
                setTimeout(() => { if (fs.existsSync(fileMusica)) fs.unlinkSync(fileMusica) }, 20000)
            }
        }

        await conn.sendMessage(m.chat, {
            text: ' ',
            cards: cards,
            mentions: [jid]
        }, { quoted: m })

        setTimeout(() => { if (fs.existsSync(fileProfilo)) fs.unlinkSync(fileProfilo) }, 20000)
    } catch (e) {
        console.error(e)
        await conn.sendMessage(m.chat, { image: { url: pfp }, caption: captionProfilo, mentions: [jid] }, { quoted: m })
    }
}

handler.command = ['info', 'profilo', 'profile']
export default handler