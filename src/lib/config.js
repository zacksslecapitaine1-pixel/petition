// ---------------------------------------------------------------
//  Configuration du site (tout ce qui se modifie se trouve ici)
// ---------------------------------------------------------------

// Clés Supabase : la clé "publishable" est faite pour être publique.
// Les données sont protégées côté base (RLS + fonctions sécurisées).
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://wyzuniqmfgsykubjqitc.supabase.co';
export const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_05X2Adm-qpye2SoIv692AA_fjZbOHFi';

// Version démo (aperçu autonome, données fictives, aucun appel réseau)
export const DEMO = import.meta.env.VITE_DEMO === '1';

export const CLASS_NAME = 'Licence 1 Informatique (DA-IA) – Groupe 1';
export const SITE = 'Addidogomé';
export const SCHOOL = 'ESGIS';

export const FILIERES = {
  ia_bigdata: {
    id: 'ia_bigdata',
    label: 'Intelligence Artificielle & Big Data',
    short: 'IA & Big Data',
    tagline: 'Données, modèles et algorithmes intelligents',
  },
  dev_web: {
    id: 'dev_web',
    label: 'Développement Web & Applications',
    short: 'Dev Web & Apps',
    tagline: 'Interfaces, code et applications du quotidien',
  },
};

export const POSITIONS = {
  pour: { id: 'pour', label: 'Pour' },
  contre: { id: 'contre', label: 'Contre' },
};

export const LETTER = {
  recipient: 'À l’attention des responsables de l’emploi du temps',
  department: 'ESGIS – Direction Académique et Pédagogique',
  subject:
    'Demande de réaménagement de l’emploi du temps – report des cours du samedi sur les autres jours de la semaine',
  salutation: 'Mesdames, Messieurs,',
  paragraphs: [
    'Nous, étudiants de la Licence 1 Informatique (Développement d’Application, Intelligence Artificielle), Groupe 1, site d’Addidogomé, année académique 2026-2027, avons l’honneur de nous adresser à vous, d’une seule voix, au nom de l’ensemble de notre classe.',
    'Nous tenons tout d’abord à vous exprimer notre sincère reconnaissance pour le travail considérable que vous accomplissez afin d’organiser nos enseignements. Nous mesurons pleinement la complexité et la rigueur qu’exige l’élaboration d’un emploi du temps, et nous vous remercions de l’attention que vous portez à notre formation.',
    'C’est donc avec un profond respect, et avec le regret de devoir vous solliciter, que nous venons vous soumettre une doléance. Notre emploi du temps s’étend actuellement du lundi au samedi, à raison de journées qui débutent à 7h30 et s’achèvent à 14h. Cette organisation, qui ne ménage aucun jour de repos complet, nous laisse très peu de temps pour nos affaires personnelles, nos obligations familiales, notre repos et un travail de révision approfondi.',
    'Aussi sollicitons-nous respectueusement la possibilité de réaménager les séances du samedi (Anglais et Topologie de IR) sur les autres jours de la semaine. Conscients que cet ajustement exigera un effort de notre part, nous l’acceptons de bon gré : certains jours, nos cours pourraient se prolonger durant l’après-midi et s’achever à 17h ou à 18h, de manière à libérer entièrement le samedi.',
    'Nous sommes convaincus qu’un tel aménagement nous permettrait d’être plus disponibles, mieux reposés et, par conséquent, plus performants dans nos études. Afin que cette demande reflète fidèlement la volonté de la classe, vous trouverez, à la suite de la présente lettre, la liste des étudiants, chacun ayant exprimé sa position et apposé sa signature.',
    'Dans l’attente d’une suite favorable, nous vous prions d’agréer, Mesdames, Messieurs, l’expression de notre haute considération.',
  ],
  signatureLines: ['Pour la classe,', 'Les étudiants de la Licence 1 Informatique (DA-IA)', 'Groupe 1 – Addidogomé'],
};
