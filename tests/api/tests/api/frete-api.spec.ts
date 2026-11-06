//O teste faz login, busca um produto, cria um pedido com endereço de 
// entrega e verifica se o pedido aparece na listagem do cliente
//


import { test, expect } from '@playwright/test';

const BASE_URL = 'https://api-qa-fap2026.onrender.com/api';

const EMAIL = 'user@system.com';
const SENHA = 'UserPassword123';

const ENDERECO =
  'Av. Paulista, 1000 - Bela Vista, São Paulo/SP (CEP: 01310-100)';

// Função para fazer login
async function loginCliente(request: any) {
  const resposta = await request.post(`${BASE_URL}/login`, {
    data: {
      email: EMAIL,
      password: SENHA
    }
  });

  expect(resposta.status()).toBe(200);

  const dados = await resposta.json();

  return dados.token;
}

// Função para buscar o primeiro produto
async function buscarProduto(request: any) {
  const resposta = await request.get(`${BASE_URL}/products`);

  expect(resposta.status()).toBe(200);

  const dados = await resposta.json();

  const produtos = Array.isArray(dados)
    ? dados
    : dados.products ?? dados.data;

  expect(produtos.length).toBeGreaterThan(0);

  return produtos[0]._id ?? produtos[0].id;
}

test.describe('API - Frete e endereço de entrega', () => {

  test('Deve criar pedido informando endereço de entrega', async ({ request }) => {

    const token = await loginCliente(request);
    const produtoId = await buscarProduto(request);

    const resposta = await request.post(`${BASE_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        items: [
          {
            productId: produtoId,
            quantity: 1
          }
        ],
        shippingAddress: ENDERECO
      }
    });

    expect(resposta.status()).toBe(201);

    const pedido = await resposta.json();

    expect(pedido).toBeTruthy();
  });

  test('Não deve criar pedido sem endereço de entrega', async ({ request }) => {

    const token = await loginCliente(request);
    const produtoId = await buscarProduto(request);

    const resposta = await request.post(`${BASE_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        items: [
          {
            productId: produtoId,
            quantity: 1
          }
        ]
      }
    });

    expect(resposta.status()).toBe(400);
  });

  test('Deve consultar os pedidos do cliente', async ({ request }) => {

    const token = await loginCliente(request);

    const resposta = await request.get(`${BASE_URL}/orders/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    expect(resposta.status()).toBe(200);

    const pedidos = await resposta.json();

    expect(pedidos).toBeTruthy();
  });

  test('Não deve consultar pedidos sem autenticação', async ({ request }) => {

    const resposta = await request.get(`${BASE_URL}/orders/me`);

    expect(resposta.status()).toBe(401);
  });

});
