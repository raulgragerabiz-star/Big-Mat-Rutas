import { DataLimitation } from '../types/logistics';

export interface ColumnInspection {
  archivo: string;
  columnasTotales: number;
  columnasClave: { nombre: string; descripcion: string; limitaciones: string }[];
  observaciones: string;
}

export const INSPECTION_DOCS: ColumnInspection[] = [
  {
    archivo: 'insocio_ee63cff6.txt (Maestro de Socios)',
    columnasTotales: 22,
    columnasClave: [
      { nombre: 'Codigo / Clave', descripcion: 'Identificador único del socio en ERP', limitaciones: '115 activos en muestra de 124 registros.' },
      { nombre: 'KM / KM desde Pinto', descripcion: 'Distancia registrada en ERP', limitaciones: '71 vacíos en columna KM; KM desde Pinto cubre 123 de 124.' },
      { nombre: 'Km carretera desde Pinto (OSRM)', descripcion: 'Distancia real calculada por carretera con OSRM', limitaciones: 'Faltan 8 socios. 6 se estiman por línea recta × factor rodeo 1,25; 2 sin coordenadas.' },
      { nombre: 'Corredor', descripcion: 'Agrupación geográfica radial desde Pinto (A-1 a A-6)', limitaciones: '7 socios quedan en "Sin coordenadas o km" o sin corredor formal.' },
      { nombre: 'Latitud / Longitud', descripcion: 'Coordenadas WGS84 para georreferenciación y ruteo', limitaciones: 'Error de escala en 614096 (-5.662.099 en vez de -5.662099). Coordenadas repetidas para varios centros en Madrid y Getafe.' }
    ],
    observaciones: 'Fuente primaria para la geografía y distancias base. Permite trazar los 12 corredores radiales principales.'
  },
  {
    archivo: 'cuadernoservicio_de4a5746.txt (Acuerdos de Servicio)',
    columnasTotales: 3,
    columnasClave: [
      { nombre: 'RUTA (tal cual sale del ERP)', descripcion: 'Nombre de la ruta contractual', limitaciones: '12 rutas definidas, cubriendo las principales zonas de expedición.' },
      { nombre: 'CENTRO LOGÍSTICO', descripcion: 'Almacén de origen', limitaciones: 'Todos asignados a Pinto.' },
      { nombre: 'DÍAS EXPEDICIÓN ACORDADOS', descripcion: 'Calendario acordado con los socios', limitaciones: 'Define días fijos (ej. lunes/miércoles, martes/jueves, miércoles único en Asturias, L-V en Madrid).' }
    ],
    observaciones: 'Marca la frecuencia de servicio prometida. En el análisis real, hasta un 23% de salidas se ejecutan en días fuera de programa debido a la acumulación de pedidos.'
  },
  {
    archivo: 'inpedidos_6b9678d8.txt (Líneas de Pedido ERP)',
    columnasTotales: 41,
    columnasClave: [
      { nombre: 'Documento', descripcion: 'Número de albarán/pedido', limitaciones: '69.400 líneas agrupadas en 22.285 pedidos.' },
      { nombre: 'Fecha / Fecha Envío', descripcion: 'Fecha de transacción y despacho', limitaciones: 'Fechas entre enero y agosto 2026 (171 días laborables analizados).' },
      { nombre: 'Codigo / Contacto', descripcion: 'Socio destinatario', limitaciones: '106 socios con actividad de pedidos directos.' },
      { nombre: 'Valor Total / Coste Total', descripcion: 'Importes económicos de los productos', limitaciones: 'No contiene peso bruto unitario por línea en el archivo plano; el peso y palés agregados provienen de la plataforma central validada.' }
    ],
    observaciones: 'Permite analizar la frecuencia real de demanda diaria y la fragmentación de pedidos por socio.'
  }
];

export const DATA_LIMITATIONS: DataLimitation[] = [
  {
    id: 'LIM-01',
    tipo: 'COORDENADAS_FALTANTES',
    severidad: 'ALTA',
    titulo: 'Socios sin coordenadas GPS (Latitud/Longitud nulas)',
    descripcion: 'Los socios 300000 (BIGMAT IBERIA S.A. central) y 589000 (INVERCONS, Plasencia) no cuentan con latitud ni longitud en el maestro.',
    afectados: ['300000 - BIGMAT IBERIA, S.A.', '589000 - INVERCONS DESARROLLOS'],
    tratamientoAplicado: 'Se clasifican como "Pendiente de validación geográfica". No se inventan coordenadas ficticias. 300000 se excluye de rutas de entrega por ser compras internas de almacén.',
    recomendacionOperativa: 'Geocodificar la dirección fiscal y nave de descarga antes de incorporar a ruta fija.'
  },
  {
    id: 'LIM-02',
    tipo: 'KM_ESTIMADO',
    severidad: 'MEDIA',
    titulo: 'Distancia estimada mediante línea recta × factor de rodeo 1,25',
    descripcion: '6 socios carecen de distancia OSRM por carretera verificada en el archivo insocio.',
    afectados: [
      '307000 - SANCHEZ QUINTANAR (132,8 km est.)',
      '469005 - ACT BRICOLAJE CORDOBA (354,0 km est.)',
      '502000 - ARIDOS GOMEZ GALGO (158,3 km est.)',
      '614089 - EZCARAYCER LA RIOJA (299,4 km est.)',
      '614094 - CALLEJA MATERIALES VALLADOLID (214,5 km est.)',
      '614096 - JOSE PORRAS PISONERO (230,3 km est.)'
    ],
    tratamientoAplicado: 'Se calcula la distancia ortodrómica (Haversine) desde Pinto y se multiplica por el factor de rodeo empírico 1,25 (la relación real observada en los 106 socios verificados es 1,29). Marcados con asterisco (*).',
    recomendacionOperativa: 'Obtener la ruta OSRM exacta con dirección postal de nave para cerrar el kilometraje real.'
  },
  {
    id: 'LIM-03',
    tipo: 'ERROR_ESCALA',
    severidad: 'INFO',
    titulo: 'Error tipográfico de escala corregido en Longitud de socio 614096',
    descripcion: 'El socio 614096 (José Porras Pisonero) presentaba longitud -5662099 por un doble punto decimal en el archivo original (-5.662.099).',
    afectados: ['614096 - JOSE PORRAS PISONERO'],
    tratamientoAplicado: 'Corregido transparentemente a -5.662099 W, situándolo correctamente en Linares de Riofrío (Salamanca).',
    recomendacionOperativa: 'Corrección documentada; sin impacto negativo en la base original.'
  },
  {
    id: 'LIM-04',
    tipo: 'COORDENADA_COMPARTIDA',
    severidad: 'INFO',
    titulo: 'Coordenadas idénticas para diferentes socios / puntos de venta',
    descripcion: 'Varios socios en Madrid capital (Sol / Chamberí / San Norberto), Getafe (San Marcos) y Coslada comparten exactamente la misma coordenada geográfica.',
    afectados: [
      '351000, 530000, 574000, 585008, 585009, 547156 (Madrid centro)',
      '499001, 585004, 585021 (Getafe)',
      '570003, 570000 (Coslada)'
    ],
    tratamientoAplicado: 'En la representación del mapa se aplica una micro-dispersión radial (5 km) para que cada socio sea visible individualmente y no quede oculto detrás de otro.',
    recomendacionOperativa: 'Actualizar las coordenadas de descarga exacta de cada muelle para el albarán de ruta.'
  },
  {
    id: 'LIM-05',
    tipo: 'EXCESO_JORNADA_FISICA',
    severidad: 'ALTA',
    titulo: 'Imposibilidad física de retorno en el día para destinos remotos (>450 km)',
    descripcion: 'Los corredores periféricos como Asturias (534 km ida = 1.068 km i/v) o Portugal Sur/Ferreira (575 km ida = 1.150 km i/v) requieren más de 14-16 horas de conducción.',
    afectados: ['ASTURIAS (Camango, Soto del Barco)', 'PORTUGAL REMOTO (Abrantes, Ferreira do Alentejo, Coimbra)'],
    tratamientoAplicado: 'El validador de jornada de 9 horas clasifica la ruta de retorno en el día como RECHAZADA. Se propone circuito bi-diario con pernocta o derivación a Porte/Operador internacional para pedidos de poco peso.',
    recomendacionOperativa: 'Establecer parada intermedia de relevo o programar rutas de 2 días (ej. salida martes, entrega miércoles, retorno jueves).'
  }
];
