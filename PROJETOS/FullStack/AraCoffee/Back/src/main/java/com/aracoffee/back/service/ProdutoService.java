package com.aracoffee.back.service;

import com.aracoffee.back.exception.DadosInvalidosException;
import com.aracoffee.back.exception.ProdutoNaoEncontradoException;
import com.aracoffee.back.model.Categoria;
import com.aracoffee.back.model.Produto;
import com.aracoffee.back.repository.ProdutoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Regras de negócio do cardápio.
 * O controller recebe a requisição HTTP e o service decide o que fazer com o MongoDB.
 */
@Service
public class ProdutoService {

    private static final int TAMANHO_MAXIMO_DESCRICAO = 160;

    private final ProdutoRepository produtoRepository;

    // Injeção de dependência pelo construtor (equivale ao @Autowired no atributo)
    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    /**
     * Lista os produtos em ordem alfabética.
     * Os dois filtros são opcionais e podem ser usados juntos.
     */
    public List<Produto> listar(String nome, String categoria) {
        boolean temNome = nome != null && !nome.isBlank();
        boolean temCategoria = categoria != null && !categoria.isBlank();

        if (temNome && temCategoria) {
            return produtoRepository.findByNomeContainingIgnoreCaseAndCategoriaOrderByNomeAsc(nome.trim(), categoria.trim());
        }
        if (temNome) {
            return produtoRepository.findByNomeContainingIgnoreCaseOrderByNomeAsc(nome.trim());
        }
        if (temCategoria) {
            return produtoRepository.findByCategoriaOrderByNomeAsc(categoria.trim());
        }
        return produtoRepository.findAll(Sort.by("nome"));
    }

    /** Destaques disponíveis, mostrados em "Hoje no balcão" na página inicial. */
    public List<Produto> listarDestaques() {
        return produtoRepository.findByDestaqueTrueAndDisponivelTrueOrderByNomeAsc();
    }

    public List<String> listarCategorias() {
        return Categoria.TODAS;
    }

    public Produto buscarPorId(String id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ProdutoNaoEncontradoException(id));
    }

    public Produto inserir(Produto produto) {
        validar(produto);
        produto.setId(null); // quem gera o id é o MongoDB
        limpar(produto);
        return produtoRepository.save(produto);
    }

    public Produto atualizar(String id, Produto dados) {
        Produto existente = buscarPorId(id); // lança 404 se não existir
        validar(dados);

        existente.setNome(dados.getNome());
        existente.setDescricao(dados.getDescricao());
        existente.setCategoria(dados.getCategoria());
        existente.setPreco(dados.getPreco());
        existente.setDestaque(dados.isDestaque());
        existente.setDisponivel(dados.isDisponivel());
        limpar(existente);

        return produtoRepository.save(existente);
    }

    public void excluir(String id) {
        if (!produtoRepository.existsById(id)) {
            throw new ProdutoNaoEncontradoException(id);
        }
        produtoRepository.deleteById(id);
    }

    /** Validação simples dos campos (lança 400 pelo GlobalExceptionHandler). */
    private void validar(Produto produto) {
        if (produto == null) {
            throw new DadosInvalidosException("Envie os dados do produto no corpo da requisição.");
        }
        if (produto.getNome() == null || produto.getNome().isBlank()) {
            throw new DadosInvalidosException("O nome do produto é obrigatório.");
        }
        if (produto.getCategoria() == null || !Categoria.TODAS.contains(produto.getCategoria().trim())) {
            throw new DadosInvalidosException("Escolha uma categoria: " + String.join(", ", Categoria.TODAS) + ".");
        }
        if (produto.getPreco() == null || produto.getPreco() <= 0) {
            throw new DadosInvalidosException("Informe um preço maior que zero (ex.: 8.50).");
        }
        if (produto.getDescricao() != null && produto.getDescricao().trim().length() > TAMANHO_MAXIMO_DESCRICAO) {
            throw new DadosInvalidosException("A descrição pode ter no máximo " + TAMANHO_MAXIMO_DESCRICAO + " caracteres.");
        }
    }

    /** Remove espaços sobrando e arredonda o preço para centavos. */
    private void limpar(Produto produto) {
        produto.setNome(produto.getNome().trim());
        produto.setCategoria(produto.getCategoria().trim());
        produto.setDescricao(produto.getDescricao() == null ? "" : produto.getDescricao().trim());
        produto.setPreco(Math.round(produto.getPreco() * 100.0) / 100.0);
    }
}
