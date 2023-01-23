export const PROMOTIONS = {
    'q': 'queen',
    'r': 'rook',
    'b': 'bishop',
    'n': 'knight'
}

export const prom_short = ['q', 'r', 'b', 'n']
export type PROMOTIONS_SHORT = typeof prom_short[number]

export const colors = ['white', 'black'] as const
export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const
export const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'] as const

export type File = typeof files[number]
export type Rank = typeof ranks[number]
export type Field = 'a0' | `${File}${Rank}`

export type GameComment = { comment?: string, colorArrows?: string[], colorFields?: string[], clk?: string, eval?: string }
export type Color = 'w' | 'b'

export type ConfigurationTagsValues = "no" | "7r" | "known" | "all"
export type PgnWriterConfiguration = {
    tags?: ConfigurationTagsValues
}

export type PgnReaderMove = {
    drawOffer?: boolean;
    moveNumber?: number,
    notation: { fig?: string | null, strike?: 'x' | null, col?: string, row?: string, check?: string, ep?: boolean
        promotion?: string | null, notation: string, disc?: string, drop?: boolean },
    variations: PgnReaderMove[],
    nag: string[],
    commentDiag?: GameComment,
    commentMove?: string,
    commentAfter?: string,
    turn?: Color
    from: Field,
    to: Field,
    fen?: string,
    index?: number,
    prev?: number,
    next?: number,
    variationLevel?: number
}