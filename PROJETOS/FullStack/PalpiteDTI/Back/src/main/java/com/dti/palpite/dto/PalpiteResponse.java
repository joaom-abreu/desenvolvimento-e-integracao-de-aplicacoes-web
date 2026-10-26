package com.dti.palpite.dto;

import com.dti.palpite.model.Palpite;

import java.time.Instant;

/** Um palpite como a API devolve: a ordem (1ª, 2ª tentativa...), o número e a resposta do juiz. */
public record PalpiteResponse(int ordem, int numero, String resultado, String resultadoRotulo, Instant momento) {

    public static PalpiteResponse de(Palpite palpite, int ordem) {
        return new PalpiteResponse(ordem, palpite.numero(), palpite.resultado().name(),
                palpite.resultado().rotulo(), palpite.momento());
    }
}
