// All copy, prices and demo content for the studio live here.
// The quote is shown in symbolic "eurodólares" (value / 10.000), not pesos. Item prices inside the
// sample sites are demo content for each business.

export const WHATSAPP_NUMBER = '573213873880'

const img = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`

export type BusinessId = 'restaurante' | 'cafeteria' | 'tienda' | 'barberia' | 'consultorio' | 'gimnasio' | 'pasteleria'
export type SectionId = 'catalogo' | 'reservas' | 'galeria' | 'resenas' | 'ubicacion' | 'pagos' | 'puntos' | 'domicilios'
export type ExtraId = 'whatsapp' | 'ia' | 'promo' | 'idiomas'
export type ModuleId = SectionId | ExtraId
/** Free blocks that work on any business page */
export type GenericId = 'texto' | 'cta' | 'imagen' | 'cifras' | 'faq' | 'cinta' | 'equipo' | 'boletin'
export type BlockBg = 'pagina' | 'suave' | 'marca' | 'oscuro'

/**
 * One block of the page. `tpl` blocks are the signature pieces of the chosen template
 * (portada, cinta, ...), the rest are sections anyone can add, move, duplicate or remove.
 */
export interface Block {
  uid: string
  type: 'tpl' | SectionId | GenericId
  /** which piece of the template, for `tpl` blocks */
  part?: number
  hidden?: boolean
  /** set for a moment while the block folds shut before being removed */
  closing?: boolean
  bg?: BlockBg
  props?: Record<string, string>
}
export type FontId = 'moderna' | 'clasica' | 'elegante' | 'editorial' | 'cartel' | 'impacto' | 'amable' | 'tecnica' | 'amano' | 'audaz'
export type Mode = 'claro' | 'oscuro'
export type Radius = 'recto' | 'suave' | 'pildora'
export type Align = 'izquierda' | 'centro'
export type PhotoFilter = 'natural' | 'bn' | 'calido'

export interface Business {
  id: BusinessId
  label: string
  defaultName: string
  tagline: string
  cta: string
  photos: string[]
  brand: string
  font: FontId
  mode: Mode
  listTitle: string
  items: { name: string; price: number; img: string }[]
  bookingTitle: string
  bookingCta: string
  slots: string[]
  reviews: { text: string; who: string }[]
  chat: string
  address: string
  hours: string
  promo: string
  base: number
}

export const BUSINESSES: Business[] = [
  {
    id: 'restaurante',
    label: 'Restaurante',
    defaultName: 'La Brasa de Lucía',
    tagline: 'Cocina de leña, sazón de casa.',
    cta: 'Reservar mesa',
    photos: [img('1517248135467-4c7edcad34c4', 1400), img('1414235077428-338989a2e8c0', 1400), img('1555396273-367ea4eb4db5', 1400)],
    brand: '#c8a15a',
    font: 'clasica',
    mode: 'oscuro',
    listTitle: 'La carta',
    items: [
      { name: 'Churrasco a la leña', price: 48000, img: img('1504674900247-0877df9cc836') },
      { name: 'Mesa del chef', price: 62000, img: img('1414235077428-338989a2e8c0') },
      { name: 'Picada para dos', price: 39000, img: img('1555396273-367ea4eb4db5') },
    ],
    bookingTitle: 'Reserva tu mesa',
    bookingCta: 'Confirmar reserva',
    slots: ['12:30', '1:00', '7:00', '8:30'],
    reviews: [
      { text: 'Reservé desde el celular en un minuto y la mesa estaba lista.', who: 'Camila Restrepo' },
      { text: 'El churrasco llega como en la foto. Volvimos tres veces.', who: 'Andrés Quintero' },
    ],
    chat: 'Hola. ¿Te aparto mesa para hoy a las 7:00?',
    address: 'Cra. 13 #85-24, Bogotá',
    hours: 'Martes a domingo, 12 m a 10 pm',
    promo: 'Martes de leña: 2x1 en picadas',
    base: 1400000,
  },
  {
    id: 'cafeteria',
    label: 'Cafetería',
    defaultName: 'Café Nubia',
    tagline: 'Tostado esta semana.',
    cta: 'Pedir para llevar',
    photos: [img('1501339847302-ac426a4a7cbb', 1400), img('1509042239860-f550ce710b93', 1400), img('1495474472287-4d71bcdd2085', 1400)],
    brand: '#8fa3ad',
    font: 'cartel',
    mode: 'claro',
    listTitle: 'De la barra',
    items: [
      { name: 'Flat white', price: 9500, img: img('1509042239860-f550ce710b93') },
      { name: 'Filtrado Huila', price: 8000, img: img('1495474472287-4d71bcdd2085') },
      { name: 'Brunch de la casa', price: 26000, img: img('1504674900247-0877df9cc836') },
    ],
    bookingTitle: 'Aparta tu mesa',
    bookingCta: 'Apartar',
    slots: ['8:00', '10:30', '3:00', '5:30'],
    reviews: [
      { text: 'Pido antes de salir de la oficina y paso a recoger sin fila.', who: 'Valentina Mora' },
      { text: 'El mejor filtrado del barrio, y ahora con pago por Nequi.', who: 'Sebastián Lozano' },
    ],
    chat: 'Buenas. ¿Tu flat white de siempre para recoger?',
    address: 'Cl. 10 #4-33, Popayán',
    hours: 'Todos los días, 7 am a 8 pm',
    promo: 'Segundo café gratis antes de las 9',
    base: 1100000,
  },
  {
    id: 'tienda',
    label: 'Tienda',
    defaultName: 'Almacén Trece',
    tagline: 'Hecho para durar.',
    cta: 'Ver colección',
    photos: [img('1441986300917-64674bd600d8', 1400), img('1445205170230-053b83016050', 1400), img('1542291026-7eec264c27ff', 1400)],
    brand: '#e8b33c',
    font: 'impacto',
    mode: 'claro',
    listTitle: 'Recién llegado',
    items: [
      { name: 'Tenis Ruta 13', price: 289000, img: img('1542291026-7eec264c27ff') },
      { name: 'Reloj Mesa', price: 215000, img: img('1523275335684-37898b6baf30') },
      { name: 'Línea temporada', price: 129000, img: img('1445205170230-053b83016050') },
    ],
    bookingTitle: 'Agenda tu visita',
    bookingCta: 'Agendar',
    slots: ['10:00', '12:00', '3:00', '6:00'],
    reviews: [
      { text: 'Compré por la página, pagué por PSE y llegó en dos días.', who: 'Laura Benítez' },
      { text: 'Por fin veo el catálogo completo sin preguntar por chat.', who: 'Mateo Giraldo' },
    ],
    chat: 'Hola. Los Ruta 13 en talla 40 siguen disponibles.',
    address: 'C.C. Unicentro, local 2-14',
    hours: 'Lunes a sábado, 10 am a 8 pm',
    promo: 'Envío gratis desde $150.000',
    base: 1600000,
  },
  {
    id: 'barberia',
    label: 'Barbería',
    defaultName: 'Barbería El Patio',
    tagline: 'Corte clásico, sin afán.',
    cta: 'Agendar corte',
    photos: [img('1585747860715-2ba37e788b70', 1400), img('1503951914875-452162b0f3f1', 1400), img('1621605815971-fbc98d665033', 1400)],
    brand: '#1c1c1c',
    font: 'editorial',
    mode: 'claro',
    listTitle: 'Servicios',
    items: [
      { name: 'Corte clásico', price: 28000, img: img('1503951914875-452162b0f3f1') },
      { name: 'Barba y perfilado', price: 20000, img: img('1621605815971-fbc98d665033') },
      { name: 'Corte y barba', price: 42000, img: img('1585747860715-2ba37e788b70') },
    ],
    bookingTitle: 'Elige tu turno',
    bookingCta: 'Confirmar turno',
    slots: ['9:00', '11:30', '2:00', '4:30'],
    reviews: [
      { text: 'Agendo el turno el domingo y llego directo a la silla.', who: 'Julián Cárdenas' },
      { text: 'Me llega el recordatorio y nunca más perdí la cita.', who: 'Felipe Arango' },
    ],
    chat: 'Hola. Tengo turno libre hoy a las 4:30, ¿te lo aparto?',
    address: 'Av. 6N #23-10, Cali',
    hours: 'Lunes a sábado, 9 am a 7 pm',
    promo: 'Corte y barba a $36.000 los lunes',
    base: 1100000,
  },
  {
    id: 'consultorio',
    label: 'Consultorio',
    defaultName: 'Clínica Dental Sonría',
    tagline: 'Odontología sin miedo, con cita el mismo día.',
    cta: 'Pedir cita',
    photos: [img('1629909613654-28e377c37b09', 1400), img('1606811841689-23dfddce3e95', 1400), img('1519494026892-80bbd2d6fd0d', 1400)],
    brand: '#1f4e3d',
    font: 'moderna',
    mode: 'claro',
    listTitle: 'Tratamientos',
    items: [
      { name: 'Valoración inicial', price: 60000, img: img('1606811841689-23dfddce3e95') },
      { name: 'Limpieza profunda', price: 120000, img: img('1629909613654-28e377c37b09') },
      { name: 'Diseño de sonrisa', price: 890000, img: img('1519494026892-80bbd2d6fd0d') },
    ],
    bookingTitle: 'Agenda tu cita',
    bookingCta: 'Confirmar cita',
    slots: ['8:00', '10:00', '2:00', '4:00'],
    reviews: [
      { text: 'Pedí la cita de noche y me atendieron al otro día.', who: 'Paola Jiménez' },
      { text: 'Todo claro desde la página: precios, horarios y ubicación.', who: 'Ricardo Salazar' },
    ],
    chat: 'Hola. ¿Agendamos tu valoración para mañana a las 10:00?',
    address: 'Cl. 53 #45-112, Medellín',
    hours: 'Lunes a viernes, 8 am a 6 pm',
    promo: 'Valoración sin costo este mes',
    base: 1500000,
  },
  {
    id: 'gimnasio',
    label: 'Gimnasio',
    defaultName: 'Fuerza Norte',
    tagline: 'Entrena en serio.',
    cta: 'Clase gratis',
    photos: [img('1534438327276-14e5300c3a48', 1400), img('1517836357463-d25dfeac3438', 1400), img('1571019613454-1cb2f99b2d8b', 1400)],
    brand: '#c9f23a',
    font: 'impacto',
    mode: 'oscuro',
    listTitle: 'Planes',
    items: [
      { name: 'Clase suelta', price: 18000, img: img('1583454110551-21f2fa2afe61') },
      { name: 'Plan mensual', price: 95000, img: img('1540497077202-7c8a3999166f') },
      { name: 'Plan trimestral', price: 250000, img: img('1549060279-7e168fcee0c2') },
    ],
    bookingTitle: 'Aparta tu clase',
    bookingCta: 'Apartar cupo',
    slots: ['5:30', '7:00', '12:15', '6:30'],
    reviews: [
      { text: 'Aparto la clase desde el celular y nunca me quedo sin cupo.', who: 'Daniela Ortiz' },
      { text: 'El plan me llega cada lunes. Ya no improviso.', who: 'Santiago Vélez' },
    ],
    chat: 'Hola. ¿Te aparto cupo en Fuerza de las 6:30?',
    address: 'Cl. 140 #19-25, Bogotá',
    hours: 'Lunes a sábado, 5 am a 10 pm',
    promo: 'Primera clase gratis esta semana',
    base: 1300000,
  },
  {
    id: 'pasteleria',
    label: 'Pastelería',
    defaultName: 'Dulce Amparo',
    tagline: 'Tortas que saben a casa.',
    cta: 'Hacer encargo',
    photos: [img('1578985545062-69928b1d9587', 1400), img('1555507036-ab1f4038808a', 1400), img('1486427944299-d1955d23e34d', 1400)],
    brand: '#d4577a',
    font: 'amable',
    mode: 'claro',
    listTitle: 'La vitrina',
    items: [
      { name: 'Torta de chocolate', price: 68000, img: img('1578985545062-69928b1d9587') },
      { name: 'Croissant de mantequilla', price: 7500, img: img('1555507036-ab1f4038808a') },
      { name: 'Caja de macarons', price: 32000, img: img('1558961363-fa8fdf82db35') },
    ],
    bookingTitle: 'Encarga tu torta',
    bookingCta: 'Encargar',
    slots: ['9:00', '11:00', '3:00', '5:00'],
    reviews: [
      { text: 'Encargué la torta por la página y llegó igualita a la foto.', who: 'Marcela Pineda' },
      { text: 'Veo qué salió del horno hoy antes de pasar.', who: 'Jorge Ibáñez' },
    ],
    chat: 'Hola. ¿Para cuántas personas es la torta?',
    address: 'Cra. 43A #9 Sur-91, Medellín',
    hours: 'Martes a domingo, 7 am a 7 pm',
    promo: 'Docena de croissants al precio de diez',
    base: 1100000,
  },
]

export interface Module {
  id: ModuleId
  label: string
  price: number
  days: number
}

export const MODULES: Module[] = [
  { id: 'catalogo', label: 'Menú o catálogo', price: 350000, days: 3 },
  { id: 'reservas', label: 'Reservas y citas', price: 450000, days: 4 },
  { id: 'galeria', label: 'Galería de fotos', price: 180000, days: 1 },
  { id: 'resenas', label: 'Reseñas de clientes', price: 150000, days: 1 },
  { id: 'ubicacion', label: 'Mapa y horarios', price: 120000, days: 1 },
  { id: 'pagos', label: 'Pagos en línea', price: 600000, days: 5 },
  { id: 'puntos', label: 'Tarjeta de puntos', price: 520000, days: 4 },
  { id: 'domicilios', label: 'Domicilios', price: 400000, days: 3 },
  { id: 'whatsapp', label: 'Botón de WhatsApp', price: 90000, days: 1 },
  { id: 'ia', label: 'Asistente con IA', price: 900000, days: 6 },
  { id: 'promo', label: 'Cinta de promociones', price: 80000, days: 1 },
  { id: 'idiomas', label: 'Español e inglés', price: 300000, days: 3 },
]

/** Names of each template's own pieces, in order. Must match the template's top-level blocks. */
export const TEMPLATE_PARTS: Record<BusinessId, string[]> = {
  restaurante: ['Portada', 'Cinta', 'Declaración', 'Banda de plato'],
  cafeteria: ['Portada', 'Encuesta', 'Misión'],
  tienda: ['Portada', 'Categorías', 'Promesa'],
  barberia: ['Portada', 'Collage', 'Video'],
  consultorio: ['Portada', 'Garantías', 'Primera visita', 'Banda'],
  gimnasio: ['Portada', 'Cinta', 'Horario', 'Banda'],
  pasteleria: ['Portada', 'Del horno'],
}

export const GENERIC_IDS: GenericId[] = ['texto', 'cta', 'imagen', 'cifras', 'faq', 'cinta', 'equipo', 'boletin']

export const BLOCK_META: Record<SectionId | GenericId, { label: string; hint: string; price: number; days: number }> = {
  catalogo: { label: 'Menú o catálogo', hint: 'Productos con precio', price: 350000, days: 3 },
  reservas: { label: 'Reservas y citas', hint: 'El cliente agenda solo', price: 450000, days: 4 },
  galeria: { label: 'Galería de fotos', hint: 'Tu local y tu trabajo', price: 180000, days: 1 },
  resenas: { label: 'Reseñas', hint: 'Lo que dicen de ti', price: 150000, days: 1 },
  ubicacion: { label: 'Mapa y horarios', hint: 'Cómo llegar y cuándo', price: 120000, days: 1 },
  pagos: { label: 'Pagos en línea', hint: 'Nequi, PSE y tarjeta', price: 600000, days: 5 },
  puntos: { label: 'Tarjeta de puntos', hint: 'Premia al que vuelve', price: 520000, days: 4 },
  domicilios: { label: 'Domicilios', hint: 'Zonas y costo de envío', price: 400000, days: 3 },
  texto: { label: 'Texto', hint: 'Título y párrafo', price: 60000, days: 1 },
  cta: { label: 'Llamada a la acción', hint: 'Frase grande y botón', price: 60000, days: 1 },
  imagen: { label: 'Imagen ancha', hint: 'Foto de lado a lado', price: 50000, days: 1 },
  cifras: { label: 'Cifras', hint: 'Tres números que venden', price: 80000, days: 1 },
  faq: { label: 'Preguntas frecuentes', hint: 'Se abren al tocar', price: 120000, days: 1 },
  cinta: { label: 'Cinta en movimiento', hint: 'Texto que corre', price: 50000, days: 1 },
  equipo: { label: 'Equipo', hint: 'Las caras del negocio', price: 140000, days: 2 },
  boletin: { label: 'Boletín', hint: 'Captura correos', price: 160000, days: 2 },
}

export const EXTRAS: { id: ExtraId; label: string; price: number; days: number }[] = [
  { id: 'whatsapp', label: 'Botón de WhatsApp', price: 90000, days: 1 },
  { id: 'ia', label: 'Asistente con IA', price: 900000, days: 6 },
  { id: 'promo', label: 'Cinta de promociones', price: 80000, days: 1 },
  { id: 'idiomas', label: 'Español e inglés', price: 300000, days: 3 },
]

export const blockLabel = (block: Block, business: BusinessId) =>
  block.type === 'tpl' ? (TEMPLATE_PARTS[business][block.part ?? 0] ?? 'Bloque') : BLOCK_META[block.type].label

/** The template's own pieces as blocks. The first one keeps the id "hero" so edits can find it. */
export const templateBlocks = (business: BusinessId): Block[] =>
  TEMPLATE_PARTS[business].map((_, i) => ({ uid: i === 0 ? 'hero' : `tpl-${i}`, type: 'tpl', part: i }))

export const initialBlocks = (business: BusinessId): Block[] => [
  ...templateBlocks(business),
  { uid: 'catalogo', type: 'catalogo' },
  { uid: 'reservas', type: 'reservas' },
]

export const SECTION_IDS: SectionId[] = ['catalogo', 'reservas', 'galeria', 'resenas', 'ubicacion', 'pagos', 'puntos', 'domicilios']
export const isSection = (id: ModuleId): id is SectionId => (SECTION_IDS as string[]).includes(id)
export const moduleLabel = (id: ModuleId) => MODULES.find((m) => m.id === id)!.label

export const BASE_DAYS = 7
export const MONTHLY = 120000 // hosting, dominio y soporte

export const SWATCHES = ['#b3261e', '#c8a15a', '#1f4e3d', '#27408b', '#8fa3ad', '#c9f23a', '#d4577a', '#1c1c1c']

const font = (label: string, family: string, weight: string, stretch = '100%', track = '-0.02em', textCase = 'none') => ({
  label,
  vars: { '--s-head': family, '--s-head-w': weight, '--s-head-stretch': stretch, '--s-head-track': track, '--s-head-case': textCase },
})

export const FONTS: Record<FontId, { label: string; vars: Record<string, string> }> = {
  moderna: font('Moderna', "'Host Grotesk Variable', sans-serif", '600', '100%', '-0.03em'),
  clasica: font('Clásica', "'Playfair Display Variable', Georgia, serif", '500', '100%', '-0.01em'),
  elegante: font('Elegante', "'DM Serif Display', Georgia, serif", '400', '100%', '-0.01em'),
  editorial: font('Editorial', "'Cormorant Garamond', Georgia, serif", '400', '100%', '0em', 'uppercase'),
  cartel: font('Cartel', "'Big Shoulders Variable', sans-serif", '800', '100%', '0em', 'uppercase'),
  impacto: font('Impacto', "'Archivo Variable', sans-serif", '800', '70%', '0em', 'uppercase'),
  amable: font('Amable', "'Bricolage Grotesque Variable', sans-serif", '700', '100%', '-0.03em'),
  tecnica: font('Técnica', "'Space Grotesk Variable', sans-serif", '600', '100%', '-0.03em'),
  amano: font('A mano', "'Caveat Variable', cursive", '700', '100%', '0em'),
  audaz: font('Audaz', "'Unbounded Variable', sans-serif", '700', '100%', '-0.04em', 'uppercase'),
}

/** Rough average glyph width in em per display font, used to fit headlines to their box. */
export const FONT_WIDTH: Record<FontId, number> = {
  moderna: 0.56,
  clasica: 0.52,
  elegante: 0.52,
  editorial: 0.56,
  cartel: 0.44,
  impacto: 0.43,
  amable: 0.56,
  tecnica: 0.58,
  amano: 0.42,
  audaz: 0.86,
}

export interface Preset {
  name: string
  brand: string
  font: FontId
  mode: Mode
  radius: Radius
}

/** Ready-made looks: one click changes colour, type, background and corners together. */
export const PRESETS: Preset[] = [
  { name: 'De autor', brand: '#c8a15a', font: 'clasica', mode: 'oscuro', radius: 'recto' },
  { name: 'Cartel', brand: '#b3261e', font: 'cartel', mode: 'claro', radius: 'recto' },
  { name: 'Editorial', brand: '#1c1c1c', font: 'editorial', mode: 'claro', radius: 'recto' },
  { name: 'Fresco', brand: '#1f4e3d', font: 'moderna', mode: 'claro', radius: 'pildora' },
  { name: 'Nocturno', brand: '#c9f23a', font: 'impacto', mode: 'oscuro', radius: 'suave' },
  { name: 'Dulce', brand: '#d4577a', font: 'amable', mode: 'claro', radius: 'pildora' },
]

export const FILTERS: Record<PhotoFilter, { label: string; css: string }> = {
  natural: { label: 'Natural', css: 'none' },
  bn: { label: 'Blanco y negro', css: 'grayscale(1) contrast(1.08)' },
  calido: { label: 'Cálido', css: 'sepia(0.35) saturate(1.25) contrast(1.02)' },
}

export const RADII: Record<Radius, { label: string; box: string; btn: string }> = {
  recto: { label: 'Recto', box: '0px', btn: '0px' },
  suave: { label: 'Suave', box: '10px', btn: '8px' },
  pildora: { label: 'Redondo', box: '18px', btn: '999px' },
}

export const LOGO_COUNT = 8

export interface StudioState {
  business: BusinessId
  name: string
  tagline: string
  brand: string
  mode: Mode
  font: FontId
  radius: Radius
  align: Align
  photo: number
  filter: PhotoFilter
  /** headline size multiplier, 0.8 to 1.2 */
  scale: number
  logoPreset: number
  logo: string | null
  /** floating add-ons: WhatsApp button, AI assistant, promo ribbon, languages */
  modules: ModuleId[]
  blocks: Block[]
}

export const initialState = (): StudioState => {
  const b = BUSINESSES[0]
  return {
    business: b.id,
    name: '',
    tagline: '',
    brand: b.brand,
    mode: b.mode,
    font: b.font,
    radius: 'pildora',
    align: 'izquierda',
    photo: 0,
    filter: 'natural',
    scale: 1,
    logoPreset: 0,
    logo: null,
    modules: ['whatsapp'],
    blocks: initialBlocks(b.id),
  }
}

export const getBusiness = (id: BusinessId) => BUSINESSES.find((b) => b.id === id)!

export function quote(s: StudioState) {
  const b = getBusiness(s.business)
  const items = [
    ...s.blocks
      .filter((bl) => bl.type !== 'tpl' && !bl.hidden && !bl.closing)
      .map((bl) => ({ key: bl.uid, ...BLOCK_META[bl.type as SectionId | GenericId] })),
    ...EXTRAS.filter((e) => s.modules.includes(e.id)).map((e) => ({ key: e.id, hint: '', ...e })),
  ]
  const total = b.base + items.reduce((a, m) => a + m.price, 0)
  const days = BASE_DAYS + items.reduce((a, m) => a + m.days, 0)
  return { base: b.base, mods: items, total, days }
}

/** Quote values are symbolic. The currency is a made-up one, the "eurodólar", so nobody reads it as a real price. */
export const pts = (n: number) => `€$ ${Math.round(n / 10000)}`

export const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO')

const luminance = (hex: string) => {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** WCAG contrast ratio between two hex colours. */
export const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** The brand colour when it can be read as text on `surface`, otherwise the fallback. */
export const readable = (brand: string, surface: string, fallback: string) => (contrast(brand, surface) >= 3 ? brand : fallback)

/** Dark or cream text, whichever reads better on the given hex colour. */
export function onColor(hex: string) {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  return L > 0.36 ? '#16110b' : '#fbf6ea'
}
