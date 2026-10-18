package com.aracoffee.back.config;

import com.aracoffee.back.model.Produto;
import com.aracoffee.back.repository.ProdutoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Roda uma vez quando a API sobe.
 *
 * Se a coleção "produtos" estiver vazia, grava um cardápio de exemplo para a
 * página de Cardápio do front não aparecer vazia na primeira vez.
 *
 * Se o MongoDB Atlas não responder, só registra um aviso no log: a API continua
 * subindo e o /api/status mostra "mongodb": "offline".
 */
@Component
public class CardapioInicial implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(CardapioInicial.class);

    private final ProdutoRepository produtoRepository;
    private final boolean popularAoIniciar;

    public CardapioInicial(ProdutoRepository produtoRepository,
                           @Value("${app.cardapio.popular-ao-iniciar:true}") boolean popularAoIniciar) {
        this.produtoRepository = produtoRepository;
        this.popularAoIniciar = popularAoIniciar;
    }

    @Override
    public void run(String... args) {
        if (!popularAoIniciar) {
            return;
        }

        try {
            if (produtoRepository.count() > 0) {
                return;
            }

            produtoRepository.saveAll(List.of(
                    new Produto(null, "Espresso", "Dose curta de grãos do Sul de Minas, com crema espessa.", "Cafés", 6.00, false, true),
                    new Produto(null, "Coado na V60", "Passado na hora, um grão diferente a cada semana.", "Cafés", 9.50, true, true),
                    new Produto(null, "Cappuccino da casa", "Espresso, leite vaporizado e um toque de canela.", "Cafés", 12.00, false, true),
                    new Produto(null, "Latte de doce de leite", "Espresso duplo com leite e doce de leite mineiro.", "Cafés", 14.00, true, true),
                    new Produto(null, "Cold brew", "Extraído a frio por 18 horas, servido com gelo.", "Bebidas geladas", 13.00, false, true),
                    new Produto(null, "Affogato", "Espresso quente sobre uma bola de sorvete de creme.", "Bebidas geladas", 15.00, false, true),
                    new Produto(null, "Chá mate com limão", "Mate gelado, limão espremido e hortelã.", "Chás", 8.00, false, true),
                    new Produto(null, "Bolo de fubá com goiabada", "Fatia generosa, receita de família.", "Doces", 9.00, false, true),
                    new Produto(null, "Brownie com flor de sal", "Chocolate 70% e casquinha crocante.", "Doces", 10.00, false, false),
                    new Produto(null, "Pão de queijo", "Porção com 4, saindo do forno a cada meia hora.", "Salgados", 8.50, true, true),
                    new Produto(null, "Pão na chapa", "Pão francês com manteiga, tostado na chapa.", "Salgados", 7.00, false, true)
            ));

            log.info("Cardápio de exemplo gravado na coleção \"produtos\" do MongoDB Atlas.");
        } catch (Exception e) {
            log.warn("Não foi possível gravar o cardápio de exemplo: o MongoDB Atlas não respondeu. "
                    + "Confira a connection string e o Network Access.");
        }
    }
}
