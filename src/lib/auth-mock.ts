import { MOCK_USER } from '@/mocks/user';

export async function mockLogin(email: string, password: string) {
  // Simula latência do fluxo OAuth + chamada ao /bff/user/logged
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Em produção: qualquer usuário válido na Onfly passa aqui.
  // No mock: aceitamos só as credenciais de teste para simular esse comportamento.
  // IMPORTANTE: nunca criar lógica de senha própria em produção — a Onfly é a fonte de verdade.
  if (
    email === 'edson.hackathon@onfly.com.br' &&
    password === 'onfly@2026'
  ) {
    // Simula o upsert na nossa tabela com os dados vindos da Onfly
    // Em produção: await db.upsert('users', { onfly_id: user.id, ...userData })
    return { success: true as const, user: MOCK_USER };
  }

  // Em produção: esse erro viria da Onfly, não da nossa aplicação
  return { success: false as const, error: 'Credenciais inválidas na Onfly. Verifique seu acesso.' };
}
