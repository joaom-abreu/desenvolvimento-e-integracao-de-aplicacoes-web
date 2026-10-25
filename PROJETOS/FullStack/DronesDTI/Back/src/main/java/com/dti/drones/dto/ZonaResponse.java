package com.dti.drones.dto;

import com.dti.drones.model.ZonaExclusao;

public record ZonaResponse(String id, String nome, double xMin, double yMin, double xMax, double yMax) {

    public static ZonaResponse de(ZonaExclusao z) {
        return new ZonaResponse(z.getId(), z.getNome(), z.getXMin(), z.getYMin(), z.getXMax(), z.getYMax());
    }
}
