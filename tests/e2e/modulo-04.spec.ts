import { test, expect } from '@playwright/test';
import { CarrinhoPage } from '../../pages/CarrinhoPage';

test.describe('Módulo 04 - Carrinho', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://alisonmelo.github.io/tioalison-pe-t4-fap26/projetos-base/01-sistema-login/loja.html');

    await page.evaluate(() => {
      localStorage.removeItem('lojaqa_cart');
    });

    await page.reload();
  });

  test('deve adicionar produtos ao carrinho', async ({ page }) => {
    const carrinho = new CarrinhoPage(page);

    await carrinho.adicionarProduto('Teclado Mecânico Aurora RGB');
    await carrinho.adicionarProduto('SSD NVMe M.2 1TB Gen4 UltraSpeed');

    expect(await carrinho.obterQuantidade('Teclado Mecânico Aurora RGB')).toBe('1');
    expect(await carrinho.obterQuantidade('SSD NVMe M.2 1TB Gen4 UltraSpeed')).toBe('1');

    expect((await carrinho.obterSubtotal()).replace(/\u00a0/g, ' ')).toBe('R$ 739,80');
  });

  test('deve manter os produtos no carrinho após atualizar a página', async ({ page }) => {
    const carrinho = new CarrinhoPage(page);

    await carrinho.adicionarProduto('Teclado Mecânico Aurora RGB');
    await carrinho.adicionarProduto('SSD NVMe M.2 1TB Gen4 UltraSpeed');

    await page.reload();
    await carrinho.abrirCarrinho();

    expect(await carrinho.obterQuantidade('Teclado Mecânico Aurora RGB')).toBe('1');
    expect(await carrinho.obterQuantidade('SSD NVMe M.2 1TB Gen4 UltraSpeed')).toBe('1');

    expect((await carrinho.obterSubtotal()).replace(/\u00a0/g, ' ')).toBe('R$ 739,80');

    expect(await carrinho.obterCarrinhoSalvo()).toContain('Teclado Mecânico Aurora RGB');
    expect(await carrinho.obterCarrinhoSalvo()).toContain('SSD NVMe M.2 1TB Gen4 UltraSpeed');
  });

  test('deve exibir o carrinho vazio corretamente', async ({ page }) => {
    const carrinho = new CarrinhoPage(page);

    await carrinho.abrirCarrinho();

    expect(await carrinho.contarProdutos()).toBe(0);

    expect((await carrinho.obterSubtotal()).replace(/\u00a0/g, ' ')).toBe('R$ 0,00');
  });


});