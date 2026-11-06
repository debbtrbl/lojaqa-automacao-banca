//Como não há rota de cupom documentada,
//  deixei os cenários preparados e desativados


import { test, expect } from '@playwright/test';

const BASE_URL = 'https://api-qa-fap2026.onrender.com/api';

// Aguardando a rota oficial de cupom no Swagger.

test.describe('API - Cupons', () => {

  test('Deve validar um cupom válido', async ({ request }) => {

    // TODO: informar o endpoint oficial de validação.

    // Esperado:
    // Status 200
    // Cupom válido
    // Desconto aplicado corretamente

  });

  test('Não deve aceitar um cupom inexistente', async ({ request }) => {

    // TODO: informar o endpoint oficial de validação.

    // Esperado:
    // Status de erro documentado
    // Mensagem informando que o cupom não existe

  });

  test('Não deve aceitar um cupom expirado', async ({ request }) => {

    // TODO: informar o endpoint oficial de validação.

    // Esperado:
    // Cupom recusado
    // Mensagem informando que está expirado

  });

  test('Não deve aceitar cupom sem código', async ({ request }) => {

    // TODO: informar o endpoint oficial de validação.

    // Esperado:
    // Requisição recusada
    // Mensagem de campo obrigatório

  });

});
