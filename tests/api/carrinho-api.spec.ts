
//Não foi encontrado nehume endpoint de API para o carrinho,
//A página da loja apresenta a seção Carrinho, com total e botão Continuar para checkout
//O endpoint de checkout é /orders, que recebe um array de produtos e endereço de entrega
//O endpoint de categorias é /products/categories, que retorna um array de strings

import { test, expect } from '@playwright/test';

const EMAIL = 'user@system.com';
const PASSWORD = 'UserPassword123';

test.describe('API - Categorias e Carrinho', () => {

  async function fazerLogin(request: any) {
    const response = await request.post('/login', {
      data: {
        email: EMAIL,
        password: PASSWORD
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.token).toBeTruthy();

    return body.token;
  }

  // TESTE 1 - Consultar categorias
  test('GET - Deve consultar as categorias da loja', async ({ request }) => {

    const response = await request.get('/products/categories');

    // Status Code
    expect(response.status()).toBe(200);

    // Headers
    expect(response.headers()['content-type']).toContain('application/json');

    // Response JSON
    const categories = await response.json();

    expect(Array.isArray(categories)).toBeTruthy();

    // Integridade dos dados
    for (const category of categories) {
      expect(typeof category).toBe('string');
      expect(category.trim().length).toBeGreaterThan(0);
    }

    // Não deve haver categorias duplicadas
    expect(new Set(categories).size).toBe(categories.length);

  });

  // TESTE 2 - Consultar produtos para o carrinho
  test('GET - Deve consultar produtos disponíveis para compra', async ({ request }) => {

    const response = await request.get('/products');

    expect(response.status()).toBe(200);

    expect(response.headers()['content-type']).toContain('application/json');

    const products = await response.json();

    expect(Array.isArray(products)).toBeTruthy();

    for (const product of products) {
      expect(product._id).toBeTruthy();
      expect(typeof product.name).toBe('string');
      expect(typeof product.category).toBe('string');
      expect(typeof product.price).toBe('number');
      expect(typeof product.stock).toBe('number');
      expect(product.price).toBeGreaterThanOrEqual(0);
      expect(product.stock).toBeGreaterThanOrEqual(0);
      expect(product.active).toBe(true);
    }

  });

  // TESTE 3 - Finalizar compra do carrinho
  test('POST - Deve finalizar compra com produtos válidos', async ({ request }) => {

    const token = await fazerLogin(request);

    // Buscar produtos disponíveis
    const productsResponse = await request.get('/products');

    expect(productsResponse.status()).toBe(200);

    const products = await productsResponse.json();

    const product = products.find(
      (item: any) => item.stock > 0
    );

    expect(product).toBeTruthy();

    // Simular os itens adicionados ao carrinho
    const cartItems = [
      {
        productId: product._id,
        quantity: 1
      }
    ];

    const response = await request.post('/orders', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        items: cartItems,
        shippingAddress: 'Rua de Teste, 100 - Recife/PE'
      }
    });

    // Status Code
    expect(response.status()).toBe(201);

    // Headers
    expect(response.headers()['content-type']).toContain('application/json');

    // Response JSON
    const body = await response.json();

    expect(body.message).toBeTruthy();
    expect(body.order).toBeTruthy();

    // Integridade do pedido
    expect(body.order._id).toBeTruthy();
    expect(Array.isArray(body.order.items)).toBe(true);
    expect(body.order.items.length).toBe(1);
    expect(body.order.shippingAddress).toBe('Rua de Teste, 100 - Recife/PE');
    expect(body.order.total).toBeGreaterThan(0);
    expect(body.order.status).toBe('pending');

    expect(body.order.items[0].productId).toBe(product._id);
    expect(body.order.items[0].quantity).toBe(1);

  });

  // TESTE 4 - Não deve finalizar compra sem autenticação
  test('POST - Deve rejeitar checkout sem token', async ({ request }) => {

    const response = await request.post('/orders', {
      data: {
        items: [
          {
            productId: '64f1a2b3c4d5e6f7a8b9c0d1',
            quantity: 1
          }
        ],
        shippingAddress: 'Rua de Teste, 100'
      }
    });

    expect(response.status()).toBe(401);

    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();

    expect(body.error).toBeTruthy();

  });

  // TESTE 5 - Não deve aceitar carrinho vazio
  test('POST - Deve rejeitar checkout com carrinho vazio', async ({ request }) => {

    const token = await fazerLogin(request);

    const response = await request.post('/orders', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        items: [],
        shippingAddress: 'Rua de Teste, 100'
      }
    });

    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body.error).toBeTruthy();

  });

  // TESTE 6 - Não deve aceitar quantidade inválida
  test('POST - Deve rejeitar quantidade zero', async ({ request }) => {

    const token = await fazerLogin(request);

    const response = await request.post('/orders', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        items: [
          {
            productId: '64f1a2b3c4d5e6f7a8b9c0d1',
            quantity: 0
          }
        ],
        shippingAddress: 'Rua de Teste, 100'
      }
    });

    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body.error).toBeTruthy();

  });

});
