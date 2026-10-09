import { describe, it } from 'node:test';
import assert from 'node:assert';
import { linhaParaRegistro, registroParaLinha } from './historico';
import { traduzirErroAuth } from './erros-auth';
import { caminhoInterno, destinoPadrao, tipoLinkValido } from './link-email';
import { excluirConta, type DependenciasExclusao } from './excluir-conta';

describe('Histórico na conta: conversão entre registro e linha do banco', () => {
  it('registro vira linha respeitando os limites do banco', () => {
    const l = registroParaLinha({ modulo: 'PrazoZero', tipo: 'prazo', titulo: 'x'.repeat(400), detalhe: 'd'.repeat(2000), url: '/prazozero' }, 'u1');
    assert.strictEqual(l.usuario_id, 'u1');
    assert.strictEqual(l.titulo.length, 300);
    assert.strictEqual(l.detalhe!.length, 1000);
    assert.strictEqual(l.url, '/prazozero');
  });

  it('URL externa ou protocolo-relativa é trocada por "/" (o banco só aceita caminho interno)', () => {
    for (const url of ['https://externo.com', '//externo.com', 'javascript:alert(1)', '']) {
      assert.strictEqual(registroParaLinha({ modulo: 'NormaViva', tipo: 'norma', titulo: 't', url }, 'u').url, '/', url);
    }
  });

  it('título vazio vira "Sem título" e detalhe ausente vira null', () => {
    const l = registroParaLinha({ modulo: 'TeseMap', tipo: 'tese', titulo: '   ', url: '/tesemap' }, 'u');
    assert.strictEqual(l.titulo, 'Sem título');
    assert.strictEqual(l.detalhe, null);
  });

  it('preserva a data original ao importar do navegador', () => {
    const l = registroParaLinha({ modulo: 'Argumenta', tipo: 'decisao', titulo: 't', url: '/argumenta' }, 'u', '2026-10-01T10:00:00.000Z');
    assert.strictEqual((l as { criado_em?: string }).criado_em, '2026-10-01T10:00:00.000Z');
  });

  it('linha vira registro (detalhe nulo some, URL nula vira "/")', () => {
    const r = linhaParaRegistro({ id: 'a', modulo: 'PrazoZero', tipo: 'prazo', titulo: 't', detalhe: null, url: null, criado_em: '2026-10-07T00:00:00Z' });
    assert.deepStrictEqual(r, { id: 'a', modulo: 'PrazoZero', tipo: 'prazo', titulo: 't', url: '/', criadoEm: '2026-10-07T00:00:00Z' });
  });
});

describe('Mensagens de erro do login', () => {
  it('traduz os erros comuns sem revelar se o e-mail existe', () => {
    assert.strictEqual(traduzirErroAuth('Invalid login credentials'), 'E-mail ou senha incorretos.');
    assert.match(traduzirErroAuth('Email not confirmed'), /Confirme seu e-mail/);
    assert.match(traduzirErroAuth('email rate limit exceeded'), /Muitas tentativas/);
    assert.match(traduzirErroAuth('Password should be at least 6 characters'), /Senha fraca/);
    assert.match(traduzirErroAuth('algo inesperado'), /Tente novamente/);
  });
});

describe('Exclusão da conta (LGPD)', () => {
  const montar = (sobre: Partial<DependenciasExclusao> = {}) => {
    const chamadas: string[] = [];
    const dep: DependenciasExclusao = {
      usuarioAtual: async () => ({ id: 'u1', email: 'a@b.com' }),
      conferirSenha: async () => {
        chamadas.push('senha');
        return true;
      },
      apagarUsuario: async id => {
        chamadas.push(`apagar:${id}`);
        return true;
      },
      ...sobre
    };
    return { dep, chamadas };
  };

  it('com sessão e senha corretas, apaga o usuário da sessão', async () => {
    const { dep, chamadas } = montar();
    assert.deepStrictEqual(await excluirConta('segredo123', dep), { ok: true });
    assert.deepStrictEqual(chamadas, ['senha', 'apagar:u1']);
  });

  it('sem senha, ou com senha de tipo errado, recusa sem tocar em nada', async () => {
    for (const s of [undefined, null, '', 123, 'x'.repeat(201)]) {
      const { dep, chamadas } = montar();
      const r = await excluirConta(s, dep);
      assert.ok(!r.ok && r.status === 400, String(s));
      assert.deepStrictEqual(chamadas, []);
    }
  });

  it('sem sessão: 401 e nada é apagado', async () => {
    const { dep, chamadas } = montar({ usuarioAtual: async () => null });
    const r = await excluirConta('segredo123', dep);
    assert.ok(!r.ok && r.status === 401);
    assert.deepStrictEqual(chamadas, []);
  });

  it('senha incorreta: 403 e nada é apagado', async () => {
    const { dep, chamadas } = montar({ conferirSenha: async () => false });
    const r = await excluirConta('errada', dep);
    assert.ok(!r.ok && r.status === 403);
    assert.deepStrictEqual(chamadas, []);
  });

  it('falha ao apagar: 500 e a mensagem diz que nada foi apagado', async () => {
    const { dep } = montar({ apagarUsuario: async () => false });
    const r = await excluirConta('segredo123', dep);
    assert.ok(!r.ok && r.status === 500 && r.mensagem.includes('Nada foi apagado'));
  });
});

describe('Link enviado por e-mail', () => {
  it('só aceita os tipos de link conhecidos', () => {
    for (const t of ['signup', 'recovery', 'email_change']) assert.ok(tipoLinkValido(t), t);
    for (const t of [null, '', 'admin', 'RECOVERY', 'recovery;x']) assert.ok(!tipoLinkValido(t), String(t));
  });

  it('só segue para caminho interno', () => {
    assert.strictEqual(caminhoInterno('/conta', '/x'), '/conta');
    for (const p of [null, '', 'https://externo.com', '//externo.com', 'conta', '/\\externo.com']) {
      assert.strictEqual(caminhoInterno(p, '/x'), '/x', String(p));
    }
  });

  it('a recuperação de senha leva à conta; o cadastro, ao Meu espaço', () => {
    assert.strictEqual(destinoPadrao('recovery'), '/conta');
    assert.strictEqual(destinoPadrao('signup'), '/meu-espaco');
  });
});
