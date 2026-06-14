import type { MediaType } from '../types'
import type { TypeFilter, StatusFilter } from '../components/FilterBar'

const TYPE_TOOLTIP_ES: Record<MediaType, string> = {
  Movie:  'Total de películas en tu colección',
  Series: 'Total de series en tu colección',
  Book:   'Total de libros en tu colección',
  Game:   'Total de juegos en tu colección',
}

const TYPE_TOOLTIP_EN: Record<MediaType, string> = {
  Movie:  'Total movies in your collection',
  Series: 'Total series in your collection',
  Book:   'Total books in your collection',
  Game:   'Total games in your collection',
}

export function getTypeTooltip(type: MediaType, lang: 'es' | 'en'): string {
  return lang === 'es' ? TYPE_TOOLTIP_ES[type] : TYPE_TOOLTIP_EN[type]
}

// Dynamic text for average score
// Depends on the two active filters (type + status)
// For the spanish language, to achieve gramatically correct
// sentences, 2 tables are built, despite not all entries being
// needed (for uniformity) -- (masculine/femenine x singular/plural)

type Gender = 'm' | 'f'

const TYPE_INFO_ES: Record<Exclude<TypeFilter, 'All'>, { noun: string; gender: Gender }> = {
  Movie:  { noun: 'películas', gender: 'f' },
  Series: { noun: 'series',    gender: 'f' },
  Book:   { noun: 'libros',    gender: 'm' },
  Game:   { noun: 'juegos',    gender: 'm' },
}

const STATUS_ADJ_ES: Record<Exclude<StatusFilter, 'All'>, Record<Gender, { singular: string; plural: string }>> = {
  Pending:    { m: { singular: 'pendiente',   plural: 'pendientes' },  f: { singular: 'pendiente',   plural: 'pendientes' } },
  InProgress: { m: { singular: 'en progreso', plural: 'en progreso' }, f: { singular: 'en progreso', plural: 'en progreso' } },
  Completed:  { m: { singular: 'completado',  plural: 'completados' }, f: { singular: 'completada',  plural: 'completadas' } },
  Dropped:    { m: { singular: 'abandonado',  plural: 'abandonados' }, f: { singular: 'abandonada',  plural: 'abandonadas' } },
}

// Enlgish doesn't need to handle gender --> one form per status
const TYPE_NOUN_EN: Record<Exclude<TypeFilter, 'All'>, string> = {
  Movie:  'movies',
  Series: 'series',
  Book:   'books',
  Game:   'games',
}

const STATUS_ADJ_EN: Record<Exclude<StatusFilter, 'All'>, string> = {
  Pending:    'pending',
  InProgress: 'in progress',
  Completed:  'completed',
  Dropped:    'dropped',
}

function contextEs(typeFilter: TypeFilter, statusFilter: StatusFilter): string {
  if (typeFilter === 'All') {
    if (statusFilter === 'All') return 'tu colección'
    // "colección" es femenino singular
    return `tu colección ${STATUS_ADJ_ES[statusFilter].f.singular}`
  }
  const type = TYPE_INFO_ES[typeFilter]
  if (statusFilter === 'All') return `tus ${type.noun}`
  return `tus ${type.noun} ${STATUS_ADJ_ES[statusFilter][type.gender].plural}`
}

function contextEn(typeFilter: TypeFilter, statusFilter: StatusFilter): string {
  if (typeFilter === 'All') {
    if (statusFilter === 'All') return 'your collection'
    if (statusFilter === 'InProgress') return 'your items in progress'
    return `your ${STATUS_ADJ_EN[statusFilter]} items`
  }
  const noun = TYPE_NOUN_EN[typeFilter]
  if (statusFilter === 'All') return `your ${noun}`
  if (statusFilter === 'InProgress') return `your ${noun} in progress`
  return `your ${STATUS_ADJ_EN[statusFilter]} ${noun}`
}

export function getScoreTooltip(
  typeFilter: TypeFilter,
  statusFilter: StatusFilter,
  hasScore: boolean,
  lang: 'es' | 'en',
): string {
  if (lang === 'es') {
    const context = contextEs(typeFilter, statusFilter)
    return hasScore ? `Puntuación media de ${context}` : `Sin puntuación media de ${context}`
  }
  const context = contextEn(typeFilter, statusFilter)
  return hasScore ? `Average score of ${context}` : `No average score for ${context}`
}