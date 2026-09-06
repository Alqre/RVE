import {z} from 'zod';

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

export const matchFormatSchema = z.enum(['BO3', 'BO4', 'BO5', 'BO7']);
export type MatchFormat = z.infer<typeof matchFormatSchema>;

export const GAMES_BY_FORMAT: Record<MatchFormat, number> = {
  BO3: 3,
  BO4: 4,
  BO5: 5,
  BO7: 7,
};

export const PLANNING_DURATION_BY_FORMAT: Record<MatchFormat, number> = {
  BO3: 600,
  BO4: 750,
  BO5: 900,
  BO7: 1200,
};

export function getPlanningDuration(matchFormat: MatchFormat): number {
  return PLANNING_DURATION_BY_FORMAT[matchFormat] ?? PLANNING_DURATION_BY_FORMAT.BO3;
}

export const upcomingMatchSchema = z.object({
  team1LogoSrc: z.string(),
  team1Name: z.string(),
  team2LogoSrc: z.string(),
  team2Name: z.string(),
  date: z.string(),
});

export const bracketModeSchema = z.enum(['Bracket', 'Scoreboard']);
export type BracketMode = z.infer<typeof bracketModeSchema>;

export const standingsTeamSchema = z.object({
  teamName: z.string(),
  logoSrc: z.string(),
  wins: z.string(),
  losses: z.string(),
  ties: z.string(),
  points: z.string(),
});
export type StandingsTeam = z.infer<typeof standingsTeamSchema>;

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

const emptyStandingsTeam: StandingsTeam = {
  teamName: '',
  logoSrc: '',
  wins: '',
  losses: '',
  ties: '',
  points: '',
};

export const mainSceneSchema = z.object({
  tournamentName: z.string(),
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
  bracketMode: bracketModeSchema,
  division1Team1: standingsTeamSchema,
  division1Team2: standingsTeamSchema,
  division1Team3: standingsTeamSchema,
  division1Team4: standingsTeamSchema,
  division1Team5: standingsTeamSchema,
  division1Team6: standingsTeamSchema,
  division1Team7: standingsTeamSchema,
  division1Team8: standingsTeamSchema,
  division2Team1: standingsTeamSchema,
  division2Team2: standingsTeamSchema,
  division2Team3: standingsTeamSchema,
  division2Team4: standingsTeamSchema,
  division2Team5: standingsTeamSchema,
  division2Team6: standingsTeamSchema,
  division2Team7: standingsTeamSchema,
  division2Team8: standingsTeamSchema,
  schedulePeriod: z.string(),
  match1: upcomingMatchSchema,
  match2: upcomingMatchSchema,
  match3: upcomingMatchSchema,
  transparentIntro: z.boolean().optional(),
});

export type TeamSlot = z.infer<typeof teamSlotSchema>;
export type CasterSlot = z.infer<typeof casterSlotSchema>;
export type GameSlot = z.infer<typeof gameSlotSchema>;
export type UpcomingMatch = z.infer<typeof upcomingMatchSchema>;
export type MainSceneProps = z.infer<typeof mainSceneSchema>;

export const defaultMainSceneProps: MainSceneProps = {
  tournamentName: '',
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
  bracketMode: 'Bracket',
  division1Team1: emptyStandingsTeam,
  division1Team2: emptyStandingsTeam,
  division1Team3: emptyStandingsTeam,
  division1Team4: emptyStandingsTeam,
  division1Team5: emptyStandingsTeam,
  division1Team6: emptyStandingsTeam,
  division1Team7: emptyStandingsTeam,
  division1Team8: emptyStandingsTeam,
  division2Team1: emptyStandingsTeam,
  division2Team2: emptyStandingsTeam,
  division2Team3: emptyStandingsTeam,
  division2Team4: emptyStandingsTeam,
  division2Team5: emptyStandingsTeam,
  division2Team6: emptyStandingsTeam,
  division2Team7: emptyStandingsTeam,
  division2Team8: emptyStandingsTeam,
  schedulePeriod: '',
  match1: emptyMatch,
  match2: emptyMatch,
  match3: emptyMatch,
};
