const handler = async (m) => {
    m.reply('se va non sborro')
}
handler.command = ['test2']
handler.disabled = true
export default handler