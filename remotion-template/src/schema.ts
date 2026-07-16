import {z} from 'zod';

/**
 * Un "slot" = un emplacement dont le contenu est choisi par l'utilisateur final
 * (logo, nom d'équipe, killer, map...) mais dont l'animation est figée par l'auteur.
 */
export const teamSlotSchema = z.object({
  logoSrc: z.string(),
  teamName: z.string(),
});

export const casterSlotSchema = z.object({
  imageSrc: z.string(),
  name: z.string(),
});

export const gameSlotSchema = z.object({
  killerSrc: z.string(),
  killerName: z.string(),
  mapSrc: z.string(),
  mapName: z.string(),
});

export const matchFormatSchema = z.enum(['BO3', 'BO5', 'BO7']);
export type MatchFormat = z.infer<typeof matchFormatSchema>;

/** Nombre de manches (donc de paires killer+map) pour chaque format de match. */
export const GAMES_BY_FORMAT: Record<MatchFormat, number> = {
  BO3: 3,
  BO5: 5,
  BO7: 7,
};

export const upcomingMatchSchema = z.object({
  team1LogoSrc: z.string(),
  team1Name: z.string(),
  team2LogoSrc: z.string(),
  team2Name: z.string(),
  date: z.string(),
});

const emptyGameSlot: z.infer<typeof gameSlotSchema> = {
  killerSrc: '',
  killerName: '',
  mapSrc: '',
  mapName: '',
};

const emptyMatch: z.infer<typeof upcomingMatchSchema> = {
  team1LogoSrc: '',
  team1Name: '',
  team2LogoSrc: '',
  team2Name: '',
  date: '',
};

export const mainSceneSchema = z.object({
  teamA: teamSlotSchema,
  teamB: teamSlotSchema,
  roundLabel: z.string(),
  matchFormat: matchFormatSchema,
  casterA: casterSlotSchema,
  casterB: casterSlotSchema,
  game1: gameSlotSchema,
  game2: gameSlotSchema,
  game3: gameSlotSchema,
  game4: gameSlotSchema,
  game5: gameSlotSchema,
  game6: gameSlotSchema,
  game7: gameSlotSchema,
  bracketImageSrc: z.string(),
  schedulePeriod: z.string(),
  match1: upcomingMatchSchema,
  match2: upcomingMatchSchema,
  match3: upcomingMatchSchema,
});

export type TeamSlot = z.infer<typeof teamSlotSchema>;
export type CasterSlot = z.infer<typeof casterSlotSchema>;
export type GameSlot = z.infer<typeof gameSlotSchema>;
export type UpcomingMatch = z.infer<typeof upcomingMatchSchema>;
export type MainSceneProps = z.infer<typeof mainSceneSchema>;

export const defaultMainSceneProps: MainSceneProps = {
  teamA: {
    logoSrc: '',
    teamName: '',
  },
  teamB: {
    logoSrc: '',
    teamName: '',
  },
  roundLabel: 'Demi-finale',
  matchFormat: 'BO3',
  casterA: {imageSrc: '', name: ''},
  casterB: {imageSrc: '', name: ''},
  game1: emptyGameSlot,
  game2: emptyGameSlot,
  game3: emptyGameSlot,
  game4: emptyGameSlot,
  game5: emptyGameSlot,
  game6: emptyGameSlot,
  game7: emptyGameSlot,
  bracketImageSrc: '',
  schedulePeriod: '',
  match1: emptyMatch,
  match2: emptyMatch,
  match3: emptyMatch,
};
