export async function prima(m, { isOwner }) {
    if (!m.chat.endsWith('@s.whatsapp.net')) return !1;
    if (m.fromMe) return !0;
    if (!m.message) return !0;
    if (m.text.includes('sasso') || m.text.includes('carta') || m.text.includes('forbici')) return !0; 

    if (global.db.data.settings[this.user.jid]?.antiprivato && !isOwner) {
        
        try {
            await this.updateBlockStatus(m.chat, 'block');
        } catch (e) {
        }
    }
    return !1;
}