const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { once } = require('node:events');

test('diário individual: conta, lançamentos, frequência de mapas e mural', { skip: process.env.TRACKER_INTEGRACAO !== '1' }, async t => {
    const app = require('../app');
    const { pool, executar } = require('../src/database/config');
    const servidor = app.listen(0, '127.0.0.1');
    await once(servidor, 'listening');
    const origem = `http://127.0.0.1:${servidor.address().port}/api/`;
    const emails = [0, 1].map(() => `teste-${randomUUID()}@example.test`);
    const senha = 'diario-de-teste';
    t.after(async () => {
        await new Promise(resolve => servidor.close(resolve));
        try { await executar('DELETE FROM usuario WHERE email IN (?, ?)', emails); } finally { await pool.end(); }
    });
    async function chamada(rota, metodo = 'GET', dados, cookie) {
        const r = await fetch(origem + rota, { method: metodo, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: dados && JSON.stringify(dados) });
        return { status: r.status, dados: r.status === 204 ? null : await r.json(), cookie: r.headers.get('set-cookie')?.split(';')[0] };
    }
    assert.equal((await chamada('painel')).status, 401);
    const sessoes = [];
    for (const email of emails) {
        assert.equal((await chamada('usuarios', 'POST', { nome: 'Jogador', email, senha })).status, 201);
        const login = await chamada('sessao', 'POST', { email, senha });
        assert.equal(login.status, 204); sessoes.push(login.cookie);
    }
    const [a, b] = sessoes;
    const pessoal = (rota, metodo = 'GET', dados) => chamada(rota, metodo, dados, a);
    assert.equal((await chamada('usuarios', 'POST', { nome: 'Outro', email: emails[0], senha })).status, 409);
    const catalogo = (await chamada('mapas')).dados;
    const mapa = nome => catalogo.find(m => m.nome === nome).id;
    const fim = '2024-05-08', resumo = `painel?fim=${fim}`;
    assert.deepEqual((await pessoal(resumo)).dados.semana.map(d => d.minutos), Array(7).fill(0));
    const salvar = (nome, quantidade, data = fim) => pessoal('registros', 'POST', { mapa: mapa(nome), quantidade, data });
    assert.equal((await salvar('Cargo', 1)).status, 400);
    assert.equal((await salvar('Bureau', 1.5)).status, 400);
    const bureau = await salvar('Bureau', 4);
    assert.equal(bureau.status, 201);
    for (const data of [fim, '2024-05-07', '2024-05-07']) assert.equal((await salvar('Canals', 1, data)).status, 201);
    assert.equal((await salvar('Soar', 2, '2024-04-29')).status, 201);
    const painel = (await pessoal(resumo)).dados;
    assert.deepEqual([painel.semana[6].minutos, painel.minutos, painel.media, painel.diferenca, painel.partidas], [200, 280, 40, 200, 7]);
    assert.deepEqual(painel.mapas.map(m => [m.nome, m.partidas]), [['Bureau', 4], ['Canals', 3], ['Soar', 2]]);
    assert.equal(painel.registros.length, 4);
    assert.deepEqual((await chamada(resumo, 'GET', null, b)).dados.mapas, []);
    assert.equal((await chamada(`registros/${bureau.dados.id}`, 'DELETE', null, b)).status, 404);
    assert.equal((await pessoal(`registros/${bureau.dados.id}`, 'DELETE')).status, 204);
    assert.equal((await pessoal(resumo)).dados.minutos, 120);
    const simultaneos = await Promise.all([salvar('Raid', 20, '2024-03-02'), salvar('Raid', 20, '2024-03-02')]);
    assert.deepEqual(simultaneos.map(r => r.status).sort(), [201, 400]);

    const marco = { titulo: 'Fiz uma pausa', data: fim, nota: 'Depois do treino.' };
    const criado = await pessoal('conquistas', 'POST', marco); assert.equal(criado.status, 201);
    const item = `conquistas/${criado.dados.id}`;
    assert.equal((await chamada(item, 'PUT', marco, b)).status, 404);
    assert.equal((await pessoal(item, 'PUT', { ...marco, titulo: 'Pausa planejada' })).status, 204);
    const mural = (await pessoal('conquistas')).dados;
    assert.equal(mural.pessoais[0].titulo, 'Pausa planejada'); assert.equal(mural.progresso.mapas, 3);
    assert.deepEqual((await chamada('conquistas', 'GET', null, b)).dados.pessoais, []);
    assert.equal((await pessoal(item, 'DELETE')).status, 204);
    assert.equal((await pessoal('conquistas')).dados.pessoais.length, 0);
    assert.equal((await pessoal('sessao', 'DELETE')).status, 204); assert.equal((await pessoal('sessao')).status, 401);
});
