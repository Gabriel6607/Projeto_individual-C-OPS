import { $, api, avisar, duracao } from './cliente.js';
import { abrirArea, tratarErro } from './area.js';

try {
    const sessao = await abrirArea();
    const mapas = (await api('mapas')).filter(m => m.ranqueado);
    if (!mapas.length) throw new Error('Nenhum mapa ranqueado disponível para registro.');
    const form = $('#registro'), { data, mapa, quantidade } = form.elements;
    for (const m of mapas) mapa.add(new Option(m.nome, m.id));
    data.max = sessao.hoje; data.value = new URLSearchParams(location.search).get('data') || sessao.hoje;
    quantidade.max = sessao.maximoDiario;
    form.querySelector('fieldset').disabled = false;
    if (!data.value || !data.validity.valid) data.value = sessao.hoje;
    function previa() {
        const n = quantidade.valueAsNumber, valido = quantidade.validity.valid && Number.isInteger(n);
        $('#estimativa').textContent = valido ? duracao(n * sessao.minutosPorPartida) : '—';
        $('#calculo').textContent = valido ? `${n} partida(s) × ${sessao.minutosPorPartida} min` : 'Informe uma quantidade válida.';
        const atual = mapas.find(m => m.id === Number(mapa.value));
        const img = $('#imagem-mapa'); img.hidden = !atual;
        if (atual) { img.src = atual.imagem; img.alt = atual.nome; }
        $('#ver-semana').href = data.validity.valid ? `dashboard.html?fim=${data.value}` : 'dashboard.html';
    }
    form.addEventListener('input', previa); previa();
    form.addEventListener('submit', async evento => {
        evento.preventDefault(); const botao = form.querySelector('button'); botao.disabled = true; avisar();
        const n = quantidade.valueAsNumber;
        try {
            await api('registros', 'POST', { data: data.value, mapa: Number(mapa.value), quantidade: n });
            avisar(`Lançamento salvo: ${n} partida(s), ${duracao(n * sessao.minutosPorPartida)} estimados. O painel já foi atualizado.`);
            quantidade.value = 1; previa();
        } catch (erro) { tratarErro(erro); } finally { botao.disabled = false; }
    });
} catch (erro) { tratarErro(erro); }
