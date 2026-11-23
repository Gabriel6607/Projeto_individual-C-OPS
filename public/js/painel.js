import { $, api, avisar, elemento, duracao, dataBR } from './cliente.js';
import { abrirArea, tratarErro, botaoAcao } from './area.js';

const fim = $('#fim');
function mover(data, dias) {
    const d = new Date(`${data}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + dias); return d.toISOString().slice(0, 10);
}

function grafico(dados) {
    const pico = Math.max(...dados.semana.map(dia => dia.minutos), dados.limiteAtencao);
    $('#barras').replaceChildren(...dados.semana.map(dia => {
        const coluna = elemento('div', undefined, 'coluna-dia'), trilho = elemento('div', undefined, 'trilho');
        const barra = elemento('div', undefined, `barra-tempo${dia.minutos >= dados.limiteAtencao ? ' atencao' : ''}`);
        barra.style.height = `${dia.minutos / pico * 100}%`;
        trilho.append(barra); trilho.setAttribute('aria-hidden', 'true');
        const legenda = `${dataBR(dia.data)}: ${dia.partidas} partida(s), ${duracao(dia.minutos)}`;
        coluna.title = legenda; coluna.setAttribute('role', 'listitem'); coluna.setAttribute('aria-label', legenda);
        coluna.append(trilho, elemento('strong', dataBR(dia.data, { weekday: 'short' })), elemento('small', duracao(dia.minutos)));
        return coluna;
    }));
    const longos = dados.semana.filter(d => d.minutos >= dados.limiteAtencao);
    $('#pausa').classList.toggle('atencao', longos.length > 0);
    $('#pausa').textContent = longos.length ? `Em ${longos.map(d => dataBR(d.data, { day: '2-digit', month: '2-digit' })).join(', ')} você registrou pelo menos 2h estimadas. Que tal reservar uma pausa entre as partidas?`
        : dados.partidas ? 'Nesta semana, os registros diários ficaram abaixo de 2h estimadas.' : 'Os dias sem registro aparecem com zero. Anote suas partidas para começar a comparação.';
}

function exibir(dados) {
    $('#periodo').textContent = `${dataBR(dados.semana[0].data)} a ${dataBR(dados.fim)}`;
    $('#dia').textContent = duracao(dados.semana[6].minutos); $('#total').textContent = duracao(dados.minutos);
    $('#media').textContent = duracao(dados.media); $('#partidas').textContent = dados.partidas;
    $('#comparacao').textContent = dados.diferenca ? `${duracao(Math.abs(dados.diferenca))} a ${dados.diferenca > 0 ? 'mais' : 'menos'} que nos sete dias anteriores.` : 'Mesmo tempo registrado que nos sete dias anteriores.';
    grafico(dados);
    $('#sem-mapas').hidden = dados.mapas.length > 0;
    $('#lista-mapas').replaceChildren(...dados.mapas.map((mapa, i) => {
        const li = elemento('li'), img = elemento('img'), detalhe = elemento('div', undefined, 'detalhe');
        img.src = mapa.imagem; img.alt = ''; detalhe.append(elemento('strong', `${i + 1}. ${mapa.nome}`), elemento('small', `${mapa.partidas} partida(s) · ${duracao(mapa.minutos)}`)); li.append(img, detalhe); return li;
    }));
    $('#sem-registros').hidden = dados.registros.length > 0;
    $('#historico').replaceChildren(...dados.registros.map(r => {
        const linha = elemento('li'), detalhe = elemento('div', undefined, 'detalhe');
        detalhe.append(elemento('strong', r.mapa), elemento('small', `${dataBR(r.data)} · ${r.quantidade} partida(s) · ${duracao(r.minutos)}`));
        linha.append(detalhe, botaoAcao('Excluir', async () => {
            if (!confirm(`Excluir o lançamento de ${r.mapa} em ${dataBR(r.data)}?`)) return;
            await api(`registros/${r.id}`, 'DELETE'); await carregar();
        })); return linha;
    }));
    $('#novo-registro').href = `cadastrarPartida.html?data=${dados.fim}`;
    $('#resultado').hidden = false;
}

let versao = 0;
async function carregar() {
    if (!fim.value || !fim.reportValidity()) return;
    const atual = ++versao;
    avisar(); $('#resultado').hidden = true; $('#periodo').textContent = 'Carregando período…';
    $('#anterior').disabled = fim.value <= fim.min; $('#proximo').disabled = fim.value >= fim.max;
    try {
        const dados = await api(`painel?fim=${encodeURIComponent(fim.value)}`);
        if (atual === versao) exibir(dados);
    } catch (erro) { if (atual === versao) { $('#periodo').textContent = 'Período indisponível'; tratarErro(erro); } }
}

try {
    const { hoje } = await abrirArea();
    fim.disabled = false; fim.max = hoje; fim.value = new URLSearchParams(location.search).get('fim') || hoje;
    if (!fim.value || !fim.validity.valid) fim.value = hoje;
    fim.addEventListener('change', carregar);
    $('#anterior').addEventListener('click', () => { const d = mover(fim.value, -7); fim.value = d < fim.min ? fim.min : d; carregar(); });
    $('#proximo').addEventListener('click', () => { const d = mover(fim.value, 7); fim.value = d > hoje ? hoje : d; carregar(); });
    await carregar();
} catch (erro) { tratarErro(erro); }
