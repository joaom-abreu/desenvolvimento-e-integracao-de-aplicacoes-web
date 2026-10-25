package com.dti.drones.dto;

/** Arredonda números para a resposta JSON ficar legível (ex.: 12.3456 -> 12.35). */
public final class Numeros {

    private Numeros() {
    }

    public static double arredondar(double valor, int casas) {
        if (Double.isNaN(valor) || Double.isInfinite(valor)) {
            return 0;
        }
        double fator = Math.pow(10, casas);
        return Math.round(valor * fator) / fator;
    }

    public static double r2(double valor) {
        return arredondar(valor, 2);
    }

    public static double r1(double valor) {
        return arredondar(valor, 1);
    }
}
