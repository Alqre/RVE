import {z} from 'zod';

/**
 * Un "slot" = un emplacement dont le contenu est choisi par l'utilisateur final
 * (logo, nom d'équipe, clip vidéo...) mais dont l'animation est figée par l'auteur.
 */
export const teamSlotSchema = z.object({
  logoSrc: z.string(),
  teamName: z.string(),
});

export const mainSceneSchema = z.object({
  teamA: teamSlotSchema,
  teamB: teamSlotSchema,
  roundLabel: z.string(),
  clipInsertSrc: z.string(),
});

export type TeamSlot = z.infer<typeof teamSlotSchema>;
export type MainSceneProps = z.infer<typeof mainSceneSchema>;

export const defaultMainSceneProps: MainSceneProps = {
  teamA: {
    logoSrc: 'selected/teamALogo.svg',
    teamName: 'Équipe Alpha',
  },
  teamB: {
    logoSrc: 'selected/teamBLogo.svg',
    teamName: 'Équipe Beta',
  },
  roundLabel: 'Demi-finale',
  clipInsertSrc: '',
};
