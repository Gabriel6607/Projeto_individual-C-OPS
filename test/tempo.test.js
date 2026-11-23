const test = require('node:test');
const assert = require('node:assert/strict');
const { validarData, resumir } = require('../src/models/diarioModel');

test('uma semana pode atravessar o ano; dias vazios participam da média', () => {
    const p = resumir('2025-01-03', [
        { data: '2025-01-01', quantidade: 2, minutos: 80 },
        { data: '2025-01-01', quantidade: 1, minutos: 40 },
        { data: '2024-12-27', quantidade: 1, minutos: 40 }
    ]);
    assert.equal(p.semana[0].data, '2024-12-28');
    assert.deepEqual(p.semana.map(d => d.minutos), [0, 0, 0, 0, 120, 0, 0]);
    assert.deepEqual([p.partidas, p.minutos, p.media, p.diferenca], [3, 120, 17, 80]);
    assert.equal(p.registros.length, 2);
});

test('datas civis não sofrem rollover e o histórico não aceita datas futuras', () => {
    assert.equal(validarData('2024-02-29'), '2024-02-29');
    for (const data of ['2025-02-29', '2024-02-30', '9999-01-01', '18/09/2024', null]) {
        assert.throws(() => validarData(data), { status: 400 });
    }
});
