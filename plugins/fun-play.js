import { exec } from 'child_process'
import { promisify } from 'util'
import search from 'youtube-search-api'
import { writeFileSync, unlinkSync, readFileSync } from 'fs'

const execPromise = promisify(exec)

let handler = async (m, { conn, command, args, usedPrefix }) => {
    // Controllo e aggiornamento yt-dlp
    try {
        await execPromise('yt-dlp --version')
    } catch {
        await m.reply('📥 Installazione/Aggiornamento yt-dlp in corso...')
        await execPromise('pip install -U yt-dlp')
    }

    if (command === 'play' && !args.length) {
        return m.reply(`🏮 Uso: \`${usedPrefix}play [titolo]\` per cercare\n\`${usedPrefix}play audio [link]\` per scaricare musica\n\`${usedPrefix}play video [link]\` per scaricare video`)
    }

    // GESTIONE DOWNLOAD (AUDIO/VIDEO)
    if (args[0] === 'audio' || args[0] === 'video') {
        let isAudio = args[0] === 'audio'
        let url = args[1]
        if (!url || !url.includes('youtu')) return m.reply('🏮 Inserisci un link YouTube valido.')

        await m.reply(`⏳ Elaborazione ${isAudio ? 'audio' : 'video'} in corso...`)
        
        let fileName = `./tmp/${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`
        let cmd = isAudio 
            ? `yt-dlp -f "ba" -x --audio-format mp3 -o "${fileName}" "${url}"`
            : `yt-dlp -f "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]" -o "${fileName}" "${url}"`

        try {
            await execPromise(cmd)
            let data = readFileSync(fileName)
            
            if (isAudio) {
                await conn.sendMessage(m.chat, { audio: data, mimetype: 'audio/mpeg' }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, { video: data, mimetype: 'video/mp4' }, { quoted: m })
            }
            unlinkSync(fileName)
        } catch (e) {
            console.error(e)
            m.reply('❌ Errore durante il download. Riprova.')
        }
        return
    }

    // GESTIONE RICERCA (CAROSELLO)
    let query = args.join(' ')
    let results = await search.GetListByKeyword(query, false, 5)
    let videos = results.items

    const cards = videos.map(v => {
        return {
            image: { url: v.thumbnail.thumbnails[0].url },
            title: v.title,
            body: `⏱️ Durata: ${v.lengthText}\n👁️ Views: ${v.viewCountText}`,
            footer: 'YouTube Play',
            buttons: [
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🎵 Audio',
                        id: `${usedPrefix}play audio https://www.youtube.com/watch?v=${v.id}`
                    })
                },
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🎥 Video',
                        id: `${usedPrefix}play video https://www.youtube.com/watch?v=${v.id}`
                    })
                }
            ]
        }
    })

    await conn.sendMessage(m.chat, {
        text: `🔎 Risultati per: *${query}*`,
        cards: cards,
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.canale.id,
                newsletterName: global.canale.nome
            }
        }
    }, { quoted: m })
}

handler.help = ['play']
handler.tags = ['tools']
handler.command = ['play']

export default handler