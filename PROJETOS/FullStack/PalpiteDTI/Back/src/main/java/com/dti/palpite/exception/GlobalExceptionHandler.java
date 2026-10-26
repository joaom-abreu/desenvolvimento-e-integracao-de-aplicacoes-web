package com.dti.palpite.exception;

import com.mongodb.MongoException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Captura as exceções de qualquer controller e devolve um JSON padronizado
 * (ErroResposta) com o código HTTP correto e uma mensagem pronta para a tela.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResposta> naoEncontrado(RecursoNaoEncontradoException ex, HttpServletRequest req) {
        return montar(HttpStatus.NOT_FOUND, ex.getMessage(), req, Map.of());
    }

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ErroResposta> regraDoJogo(RegraNegocioException ex, HttpServletRequest req) {
        return montar(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage(), req, Map.of());
    }

    @ExceptionHandler(ConflitoException.class)
    public ResponseEntity<ErroResposta> conflito(ConflitoException ex, HttpServletRequest req) {
        return montar(HttpStatus.CONFLICT, ex.getMessage(), req, Map.of());
    }

    /** Dois palpites gravados ao mesmo tempo na mesma partida (campo @Version de Partida). */
    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ErroResposta> concorrencia(OptimisticLockingFailureException ex, HttpServletRequest req) {
        return montar(HttpStatus.CONFLICT,
                "Outro palpite foi registrado nesta partida ao mesmo tempo. Atualize a página e tente de novo.",
                req, Map.of());
    }

    /** @Valid falhou: devolve um mapa campo -> mensagem. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResposta> validacao(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError erro : ex.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(erro.getField(), erro.getDefaultMessage());
        }
        // com um campo só, a mensagem dele já serve para a tela
        String mensagem = campos.size() == 1
                ? campos.values().iterator().next()
                : "Dados inválidos. Confira os campos destacados.";
        return montar(HttpStatus.BAD_REQUEST, mensagem, req, campos);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErroResposta> argumentoInvalido(IllegalArgumentException ex, HttpServletRequest req) {
        return montar(HttpStatus.BAD_REQUEST, ex.getMessage(), req, Map.of());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResposta> jsonInvalido(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return montar(HttpStatus.BAD_REQUEST,
                "O corpo da requisição não é um JSON válido. Exemplo: { \"numero\": 42 }", req, Map.of());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErroResposta> tipoInvalido(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        return montar(HttpStatus.BAD_REQUEST,
                "Valor \"" + ex.getValue() + "\" inválido para o parâmetro \"" + ex.getName() + "\".", req, Map.of());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErroResposta> rotaInexistente(NoResourceFoundException ex, HttpServletRequest req) {
        return montar(HttpStatus.NOT_FOUND, "Endpoint não encontrado.", req, Map.of());
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErroResposta> metodo(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        return montar(HttpStatus.METHOD_NOT_ALLOWED,
                "Método " + ex.getMethod() + " não é permitido neste endpoint.", req, Map.of());
    }

    @ExceptionHandler({DataAccessResourceFailureException.class, MongoException.class})
    public ResponseEntity<ErroResposta> mongoIndisponivel(Exception ex, HttpServletRequest req) {
        return montar(HttpStatus.SERVICE_UNAVAILABLE,
                "Não foi possível conectar ao MongoDB. Confira a MONGODB_URI e o Network Access do Atlas.", req, Map.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResposta> generico(Exception ex, HttpServletRequest req) {
        log.error("Erro inesperado em {}", req.getRequestURI(), ex);
        return montar(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno no servidor.", req, Map.of());
    }

    private ResponseEntity<ErroResposta> montar(HttpStatus status, String mensagem, HttpServletRequest req,
                                                Map<String, String> campos) {
        ErroResposta corpo = new ErroResposta(status.value(), status.getReasonPhrase(), mensagem,
                req.getRequestURI(), Instant.now(), campos);
        return ResponseEntity.status(status).body(corpo);
    }
}
