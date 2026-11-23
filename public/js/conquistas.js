import { $, api, avisar, dataBR, elemento } from './cliente.js';
import { abrirArea, tratarErro, botaoAcao } from './area.js';

const form = $('#conquista');
let editando = null, hoje;
function preparar(item) {
    editando = item?.id ?? null;
    form.elements.data.value = item?.data ?? hoje; form.elements.titulo.value = item?.titulo ?? ''; form.elements.nota.value = item?.nota ?? '';
    $('#titulo-form').textContent = item ? 'Editar conquista' : 'Adicionar conquista';
    $('#salvar').textContent = item ? 'Salvar alterações' : 'Adicionar ao mural'; $('#cancelar').hidden = !item;
    if (item) form.elements.titulo.focus();
}

async function atualizar() {
    const { pessoais, progresso } = await api('conquistas');
    const metas = [['Primeira anotação', 'dia com registro', progresso.dias, 1], ['Mapas no diário', 'mapas diferentes', progresso.mapas, 3], ['Um olhar entre semanas', 'semanas com registro', progresso.semanas, 2]];
    $('#marcos').replaceChildren(...metas.map(([titulo, unidade, valor, meta]) => {
        const card = elemento('article', undefined, 'marco'), barra = elemento('progress');
        barra.max = meta; barra.value = Math.min(valor, meta); barra.setAttribute('aria-label', titulo);
        card.append(elemento('span', valor >= meta ? 'Alcançado' : 'Em andamento', 'rotulo'), elemento('h3', titulo), barra, elemento('small', `${Math.min(valor, meta)} / ${meta} ${unidade}`)); return card;
    }));
    $('#sem-conquistas').hidden = pessoais.length > 0;
    $('#pessoais').replaceChildren(...pessoais.map(item => {
        const li = elemento('li'), texto = elemento('div', undefined, 'detalhe');
        texto.append(elemento('strong', item.titulo), elemento('small', dataBR(item.data)));
        if (item.nota) texto.append(elemento('p', item.nota));
        li.append(texto, botaoAcao('Editar', () => preparar(item)), botaoAcao('Excluir', async () => {
            if (!confirm(`Excluir a conquista “${item.titulo}”?`)) return;
            await api(`conquistas/${item.id}`, 'DELETE'); if (editando === item.id) preparar();
            await atualizar(); avisar('Conquista excluída.');
        })); return li;
    }));
}

try {
    ({ hoje } = await abrirArea()); form.elements.data.max = hoje; preparar();
    await atualizar(); form.querySelector('fieldset').disabled = false;
    $('#cancelar').addEventListener('click', () => preparar());
    form.addEventListener('submit', async evento => {
        evento.preventDefault(); $('#salvar').disabled = true;
        try {
            await api(editando ? `conquistas/${editando}` : 'conquistas', editando ? 'PUT' : 'POST', Object.fromEntries(new FormData(form)));
            preparar(); await atualizar(); avisar('Conquista salva no seu mural.');
        } catch (erro) { tratarErro(erro); } finally { $('#salvar').disabled = false; }
    });
} catch (erro) { tratarErro(erro); }
