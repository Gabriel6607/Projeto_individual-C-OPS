export async function api(recurso, metodo = 'GET', dados) {
    let resposta;
    try {
        resposta = await fetch(`/api/${recurso}`, { method: metodo, credentials: 'same-origin',
            headers: dados === undefined ? {} : { 'Content-Type': 'application/json' }, body: dados === undefined ? undefined : JSON.stringify(dados) });
    } catch { throw new Error('Não foi possível conectar ao Tracker. Tente novamente.'); }
    if (resposta.status === 204) return;
    const conteudo = await resposta.json().catch(() => null);
    if (!resposta.ok || conteudo === null) throw Object.assign(new Error(conteudo?.erro || 'Não foi possível carregar os dados.'), { status: resposta.status });
    return conteudo;
}

export const $ = seletor => document.querySelector(seletor);
export function elemento(tag, texto, classe) {
    const el = document.createElement(tag);
    if (texto !== undefined) el.textContent = texto;
    if (classe) el.className = classe;
    return el;
}
export function avisar(texto = '', erro = false) {
    const caixa = $('#mensagem');
    caixa.textContent = texto;
    caixa.dataset.erro = String(erro);
}
export function duracao(minutos) {
    const horas = Math.floor(minutos / 60), resto = minutos % 60;
    return horas ? `${horas}h${resto ? ` ${resto}min` : ''}` : `${resto} min`;
}
export function dataBR(iso, opcoes = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
    return new Intl.DateTimeFormat('pt-BR', { ...opcoes, timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
}
