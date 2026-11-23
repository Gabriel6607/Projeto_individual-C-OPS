import { $, api, avisar } from './cliente.js';

const form = $('form');
if (new URLSearchParams(location.search).has('criada')) avisar('Conta criada. Entre para começar seu diário.');
form.addEventListener('submit', async evento => {
    evento.preventDefault();
    const { email, senha, nome, confirmacao } = Object.fromEntries(new FormData(form));
    const cadastro = form.dataset.acao === 'cadastrar';
    if (cadastro && confirmacao !== senha) return avisar('As duas senhas precisam ser iguais.', true);
    const botao = form.querySelector('button');
    botao.disabled = true;
    try {
        await api(cadastro ? 'usuarios' : 'sessao', 'POST', cadastro ? { nome, email, senha } : { email, senha });
        location.assign(cadastro ? 'login.html?criada=1' : 'dashboard/dashboard.html');
    } catch (erro) { avisar(erro.message, true); botao.disabled = false; }
});
