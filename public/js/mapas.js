import { $, api, avisar, elemento } from './cliente.js';

try {
    const mapas = await api('mapas');
    function exibir() {
        const filtro = $('#filtro').value;
        const itens = mapas.filter(m => filtro === 'todos' || Boolean(m.ranqueado) === (filtro === 'ranqueados'));
        $('#atlas').replaceChildren(...itens.map(m => {
            const figura = elemento('figure', undefined, 'bloco'), imagem = elemento('img'), legenda = elemento('figcaption');
            imagem.src = m.imagem; imagem.alt = ''; imagem.loading = 'lazy';
            legenda.append(elemento('strong', m.nome), m.ranqueado ? 'Desarmar / Ranqueado' : 'Mata-mata');
            figura.append(imagem, legenda); return figura;
        }));
        avisar(itens.length ? '' : 'Nenhum mapa neste modo.');
    }
    $('#filtro').addEventListener('change', exibir); exibir();
} catch (erro) { avisar(erro.message, true); }
