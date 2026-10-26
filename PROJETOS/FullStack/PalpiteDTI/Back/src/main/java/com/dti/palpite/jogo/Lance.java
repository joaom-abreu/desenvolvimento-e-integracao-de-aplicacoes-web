package com.dti.palpite.jogo;

import com.dti.palpite.model.Palpite;

/**
 * O resultado de registrar um palpite: o palpite gravado, qual tentativa foi,
 * a mensagem do juiz e, se houver, uma dica (palpite desperdiçado).
 */
public record Lance(Palpite palpite, int tentativa, String mensagem, String dica) {
}
