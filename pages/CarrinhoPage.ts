import { Page } from '@playwright/test';

export class CarrinhoPage {
    constructor(private page: Page) { }

    async abrirCarrinho() {
        await this.page.getByRole('button', { name: /Carrinho/ }).click();
    }

    async adicionarProduto(nomeProduto: string) {
        await this.page
            .locator('.product-card')
            .filter({ hasText: nomeProduto })
            .getByRole('button', { name: 'Adicionar ao carrinho' })
            .click();
    }

    async obterSubtotal() {
        return await this.page.locator('#cartTotal').innerText();
    }

    async obterQuantidade(nomeProduto: string) {
        return await this.page
            .locator('.cart-item')
            .filter({ hasText: nomeProduto })
            .locator('.quantity b')
            .innerText();
    }


    async contarProdutos() {
        return await this.page.locator('.cart-item').count();
    }

    async obterCarrinhoSalvo() {
        return await this.page.evaluate(() => {
            return localStorage.getItem('lojaqa_cart');
        });
    }
}