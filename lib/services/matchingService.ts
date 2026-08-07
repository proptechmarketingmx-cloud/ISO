import { Cliente, Propiedad } from '@prisma/client';

export const W_GEO = 0.25;
export const W_ECONOMICO = 0.30;
export const W_FISICO = 0.25;
export const W_FAMILIAR = 0.10;
export const W_DEMO = 0.10;

export function getNivelScore(score: number): 'excelente' | 'alta' | 'media' | 'baja' {
  if (score >= 95) return 'excelente';
  if (score >= 80) return 'alta';
  if (score >= 60) return 'media';
  return 'baja';
}

function parseJsonList(val: string | null | undefined): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function scoreGeografico(c: Cliente, p: Propiedad): { score: number; detalles: Record<string, string> } {
  let puntos = 0;
  const detalles: Record<string, string> = {};

  const estadoC = (c.estado_busqueda || '').trim().toLowerCase();
  const estadoP = (p.estado || '').trim().toLowerCase();
  if (estadoC && estadoP) {
    if (estadoC === estadoP) {
      puntos += 40;
      detalles.estado = '✓';
    } else {
      detalles.estado = '✗';
    }
  }

  const munC = (c.municipio || c.fraccionamiento_colonia || '').trim().toLowerCase();
  const munP = (p.municipio || '').trim().toLowerCase();
  if (munP && munC && munC.includes(munP)) {
    puntos += 25;
    detalles.municipio = '✓';
  }

  const fracC = (c.colonia || c.fraccionamiento || c.fraccionamiento_colonia || '').trim().toLowerCase();
  const fracP = (p.fraccionamiento || p.colonia || '').trim().toLowerCase();
  if (fracP && fracC && fracC.includes(fracP)) {
    puntos += 20;
    detalles.colonia_fraccionamiento = '✓';
  }

  const ciuC = (c.ciudad_busqueda || '').trim().toLowerCase();
  const ciuP = (p.ciudad || '').trim().toLowerCase();
  if (ciuC && ciuP && ciuC === ciuP) {
    puntos += 15;
    detalles.ciudad = '✓';
  }

  if (!estadoC && !munC && !ciuC) {
    return { score: 50.0, detalles: { nota: 'sin_datos_cliente' } };
  }

  return { score: Math.min(puntos, 100.0), detalles };
}

export function scoreEconomico(c: Cliente, p: Propiedad): { score: number; detalles: Record<string, string> } {
  let puntos = 0;
  const detalles: Record<string, string> = {};

  const precio = p.precio;
  const pmin = c.presupuesto_min;
  const pmax = c.presupuesto_max;

  if (precio !== null && precio !== undefined) {
    if (pmin !== null && pmin !== undefined && pmax !== null && pmax !== undefined) {
      if (precio >= pmin && precio <= pmax) {
        puntos += 60;
        detalles.precio_en_presupuesto = '✓';
      } else if (precio < pmin) {
        if (pmin > 0 && precio < pmin * 0.01) {
          detalles.precio_anomalo = `precio sospechoso (${precio}), sin puntos`;
        } else {
          // Gradualidad: una propiedad al 50% del mínimo recibe 50% de los puntos.
          const ratio = Math.min(1.0, precio / pmin);
          puntos += Math.floor(60 * ratio);
          detalles.precio_por_debajo = `${precio} < ${pmin}`;
        }
      } else {
        const exceso = pmax > 0 ? (precio - pmax) / pmax : 1;
        puntos += Math.max(0, Math.floor(40 * (1 - exceso * 2)));
        detalles.precio_sobre_presupuesto = `exceso ${Math.round(exceso * 100)}%`;
      }
    } else if (pmax !== null && pmax !== undefined) {
      if (precio <= pmax) {
        puntos += 50;
        detalles.precio_dentro_max = '✓';
      } else {
        const exceso = pmax > 0 ? (precio - pmax) / pmax : 1;
        puntos += Math.max(0, Math.floor(40 * (1 - exceso * 2)));
        detalles.precio_sobre_max = `exceso ${Math.round(exceso * 100)}%`;
      }
    } else if (pmin !== null && pmin !== undefined) {
      if (precio >= pmin) {
        puntos += 40;
        detalles.precio_sobre_min = '✓';
      }
    }
  }

  const creditoC = (c.tipo_credito || '').toLowerCase();
  const creditosP = parseJsonList(p.creditos_aceptados).map((x) => x.toLowerCase());
  if (creditoC && creditosP.length > 0) {
    if (creditosP.includes(creditoC) || creditosP.includes('contado')) {
      puntos += 25;
      detalles.credito = '✓';
    } else {
      detalles.credito = '✗';
    }
  }

  const ingRec = p.ingreso_recomendado;
  const ingC = c.ingreso_mensual;
  if (ingRec && ingC) {
    if (ingC >= ingRec) {
      puntos += 15;
      detalles.ingreso = '✓';
    } else {
      const ratio = ingC / ingRec;
      puntos += Math.floor(15 * ratio);
      detalles.ingreso = `déficit ${Math.round((1 - ratio) * 100)}%`;
    }
  }

  return { score: Math.min(puntos, 100.0), detalles };
}

export function scoreFisico(c: Cliente, p: Propiedad): { score: number; detalles: Record<string, string> } {
  let puntos = 0;
  let checks = 0;
  const detalles: Record<string, string> = {};

  if (c.tipo_propiedad && p.tipo) {
    checks++;
    if (c.tipo_propiedad.toLowerCase() === p.tipo.toLowerCase()) {
      puntos++;
      detalles.tipo_propiedad = '✓';
    } else {
      detalles.tipo_propiedad = '✗';
    }
  }

  if (c.habitaciones_pa !== null && c.habitaciones_pa !== undefined && p.recamaras !== null && p.recamaras !== undefined) {
    checks++;
    if (p.recamaras >= c.habitaciones_pa) {
      puntos++;
      detalles.recamaras_pa = '✓';
    } else {
      detalles.recamaras_pa = `✗ (${p.recamaras}/${c.habitaciones_pa})`;
    }
  }

  if (c.habitaciones_pb !== null && c.habitaciones_pb !== undefined && p.recamaras_pb !== null && p.recamaras_pb !== undefined) {
    checks++;
    if (p.recamaras_pb >= c.habitaciones_pb) {
      puntos++;
      detalles.recamaras_pb = '✓';
    } else {
      detalles.recamaras_pb = `✗ (${p.recamaras_pb}/${c.habitaciones_pb})`;
    }
  }

  if (c.banos !== null && c.banos !== undefined && p.banos !== null && p.banos !== undefined) {
    checks++;
    if (p.banos >= c.banos) {
      puntos++;
      detalles.banos = '✓';
    }
  }

  if (c.estacionamiento !== null && c.estacionamiento !== undefined && p.estacionamientos !== null && p.estacionamientos !== undefined) {
    checks++;
    if (p.estacionamientos >= c.estacionamiento) {
      puntos++;
      detalles.estacionamientos = '✓';
    }
  }

  if (c.m2_terreno_min && p.m2_terreno) {
    checks++;
    if (p.m2_terreno >= c.m2_terreno_min) {
      puntos++;
      detalles.terreno_min = '✓';
    }
  }

  if (c.m2_terreno_max && p.m2_terreno) {
    checks++;
    if (p.m2_terreno <= c.m2_terreno_max) {
      puntos++;
      detalles.terreno_max = '✓';
    } else {
      detalles.terreno_max = `✗ (${p.m2_terreno} > ${c.m2_terreno_max})`;
    }
  }

  if (c.m2_construccion_min && p.m2_construccion) {
    checks++;
    if (p.m2_construccion >= c.m2_construccion_min) {
      puntos++;
      detalles.construccion_min = '✓';
    }
  }

  if (c.m2_construccion_max && p.m2_construccion) {
    checks++;
    if (p.m2_construccion <= c.m2_construccion_max) {
      puntos++;
      detalles.construccion_max = '✓';
    } else {
      detalles.construccion_max = `✗ (${p.m2_construccion} > ${c.m2_construccion_max})`;
    }
  }

  if (c.antiguedad_max !== null && c.antiguedad_max !== undefined && p.antiguedad !== null && p.antiguedad !== undefined) {
    checks++;
    if (p.antiguedad <= c.antiguedad_max) {
      puntos++;
      detalles.antiguedad = '✓';
    }
  }

  if (c.niveles_max !== null && c.niveles_max !== undefined && p.niveles !== null && p.niveles !== undefined) {
    checks++;
    if (p.niveles <= c.niveles_max) {
      puntos++;
      detalles.niveles = '✓';
    } else {
      detalles.niveles = `✗ (${p.niveles} > ${c.niveles_max})`;
    }
  }

  const amC = new Set(parseJsonList(c.amenidades_deseadas));
  const amP = new Set(parseJsonList(p.amenidades));
  if (amC.size > 0 && amP.size > 0) {
    checks++;
    let matches = 0;
    amC.forEach((item) => {
      if (amP.has(item)) matches++;
    });
    puntos += matches / amC.size;
    detalles.amenidades = `${matches}/${amC.size}`;
  }

  const idealParaP = new Set(parseJsonList(p.ideal_para).map((x) => x.toLowerCase()));
  const motivacionC = (c.motivacion || '').toLowerCase().trim();
  if (idealParaP.size > 0 && motivacionC) {
    checks++;
    if (idealParaP.has(motivacionC)) {
      puntos++;
      detalles.ideal_para = '✓';
    } else {
      detalles.ideal_para = 'no prioritario';
    }
  }

  if (checks === 0) {
    return { score: 50.0, detalles: { nota: 'sin_datos_fisicos' } };
  }

  return { score: Number(((puntos / checks) * 100).toFixed(2)), detalles };
}

export function scoreFamiliar(c: Cliente, p: Propiedad): { score: number; detalles: Record<string, string> } {
  let puntos = 0;
  let checks = 0;
  const detalles: Record<string, string> = {};

  if (c.hijos !== null && c.hijos !== undefined && p.hijos_ideal !== null && p.hijos_ideal !== undefined) {
    checks++;
    if (p.hijos_ideal === 0) {
      if (c.hijos === 0) {
        puntos++;
        detalles.hijos = '✓';
      } else {
        detalles.hijos = '✗';
      }
    } else if (c.hijos <= p.hijos_ideal) {
      puntos++;
      detalles.hijos = '✓';
    } else {
      detalles.hijos = '✗';
    }
  }

  if (c.mascotas !== null && c.mascotas !== undefined && p.mascotas_ideal !== null && p.mascotas_ideal !== undefined) {
    checks++;
    if (c.mascotas === 0 || p.mascotas_ideal > 0) {
      puntos++;
      detalles.mascotas = '✓';
    } else {
      detalles.mascotas = '✗';
    }
  }

  if (c.integrantes_hogar !== null && c.integrantes_hogar !== undefined && p.integrantes_ideal !== null && p.integrantes_ideal !== undefined) {
    checks++;
    if (c.integrantes_hogar <= p.integrantes_ideal) {
      puntos++;
      detalles.integrantes = '✓';
    }
  }

  if (checks === 0) {
    return { score: 50.0, detalles: { nota: 'sin_datos_familiares' } };
  }

  return { score: Number(((puntos / checks) * 100).toFixed(2)), detalles };
}

export function scoreDemografico(c: Cliente, p: Propiedad): { score: number; detalles: Record<string, string> } {
  let puntos = 0;
  let checks = 0;
  const detalles: Record<string, string> = {};

  if (p.estado_civil_ideal && c.estado_civil) {
    checks++;
    if (p.estado_civil_ideal.toLowerCase() === c.estado_civil.toLowerCase()) {
      puntos++;
      detalles.estado_civil = '✓';
    }
  }

  if (p.genero_ideal && c.genero) {
    checks++;
    if (['cualquiera', c.genero.toLowerCase()].includes(p.genero_ideal.toLowerCase())) {
      puntos++;
      detalles.genero = '✓';
    }
  }

  if (p.ingreso_recomendado && c.ingreso_mensual) {
    checks++;
    if (c.ingreso_mensual >= p.ingreso_recomendado * 0.9) {
      puntos++;
      detalles.ingreso_demo = '✓';
    }
  }

  if (checks === 0) {
    return { score: 50.0, detalles: { nota: 'sin_datos_demo' } };
  }

  return { score: Number(((puntos / checks) * 100).toFixed(2)), detalles };
}

export function calcularCompatibilidad(c: Cliente, p: Propiedad) {
  const { score: sGeo, detalles: dGeo } = scoreGeografico(c, p);
  const { score: sEco, detalles: dEco } = scoreEconomico(c, p);
  const { score: sFis, detalles: dFis } = scoreFisico(c, p);
  const { score: sFam, detalles: dFam } = scoreFamiliar(c, p);
  const { score: sDem, detalles: dDem } = scoreDemografico(c, p);

  const total = Number((sGeo * W_GEO + sEco * W_ECONOMICO + sFis * W_FISICO + sFam * W_FAMILIAR + sDem * W_DEMO).toFixed(2));

  return {
    score_total: total,
    score_geo: Number(sGeo.toFixed(2)),
    score_economico: Number(sEco.toFixed(2)),
    score_fisico: Number(sFis.toFixed(2)),
    score_familiar: Number(sFam.toFixed(2)),
    score_demo: Number(sDem.toFixed(2)),
    nivel: getNivelScore(total),
    detalle_json: {
      geografico: dGeo,
      economico: dEco,
      fisico: dFis,
      familiar: dFam,
      demografico: dDem,
    },
  };
}
