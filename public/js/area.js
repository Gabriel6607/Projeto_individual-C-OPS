import { $, api, avisar } from './cliente.js';

export function tratarErro(erro) {
    if (erro.status === 401) location.replace('../login.html');
    else avisar(erro.message, true);
}

export async function abrirArea() {
    $('#topo-diario').innerHTML = `<div class="largura barra">
        <a class="marca" href="../index.html"><img src="../assets/home/c-ops-tracker.svg" alt="C-ops Tracker"></a>
        <nav class="menu" aria-label="Diário do jogador"><a href="dashboard.html">Tempo de jogo</a><a href="cadastrarPartida.html">Registrar partidas</a><a href="conquista.html">Conquistas</a></nav>
        <div class="conta"><span id="jogador"></span><button class="botao secundario" id="sair" type="button">Sair</button></div></div>`;
    for (const a of document.querySelectorAll('.menu a')) if (a.pathname === location.pathname) a.setAttribute('aria-current', 'page');
    $('#sair').addEventListener('click', async () => {
        try { await api('sessao', 'DELETE'); location.replace('../login.html'); } catch (erro) { tratarErro(erro); }
    });
    const sessao = await api('sessao');
    $('#jogador').textContent = sessao.usuario.nome;
    return sessao;
}

export function botaoAcao(texto, acao) {
    const botao = document.createElement('button');
    botao.type = 'button'; botao.className = 'botao secundario'; botao.textContent = texto;
    botao.addEventListener('click', async () => {
        botao.disabled = true;
        try { await acao(); } catch (erro) { tratarErro(erro); } finally { botao.disabled = false; }
    });
    return botao;
}
