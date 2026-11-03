import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from './config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const MESSAGES = {
  already_registered: 'Cette personne s’est déjà enregistrée dans cette filière. Un seul vote par étudiant.',
  invalid_name: 'Nom ou prénom invalide. Vérifiez l’orthographe (2 caractères minimum).',
  invalid_phone: 'Numéro de téléphone invalide. Exemple : 92 10 19 69 ou +228 92 10 19 69.',
  invalid_genre: 'Veuillez choisir votre genre.',
  outdated_client: 'Cette page est périmée. Actualisez-la (rechargez le site) puis réessayez.',
  invalid_signature: 'La signature n’a pas pu être lue. Dessinez-la de nouveau.',
  invalid_filiere: 'Filière invalide.',
  invalid_position: 'Position invalide.',
  unauthorized: 'Mot de passe incorrect.',
  locked: 'Trop d’essais. Réessayez dans 5 minutes.',
  weak_password: 'Mot de passe trop court (8 caractères minimum).',
};

export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function toError(error) {
  const raw = (error && (error.message || error.details)) || '';
  const code = Object.keys(MESSAGES).find((k) => raw.includes(k));
  if (code) return new ApiError(code, MESSAGES[code]);
  if (/fetch|network|Failed|timeout/i.test(raw) || !raw)
    return new ApiError('network', 'Connexion impossible. Vérifiez votre réseau puis réessayez.');
  return new ApiError('unknown', 'Une erreur est survenue. Réessayez dans un instant.');
}

const clean = (pw) => String(pw ?? '').normalize('NFC').trim().toLowerCase();

async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw toError(error);
  return data;
}

export const submitSignature = (payload) =>
  rpc('submit_signature', {
    p_filiere: payload.filiere,
    p_nom: payload.nom,
    p_prenom: payload.prenom,
    p_genre: payload.genre,
    p_telephone: payload.telephone,
    p_position: payload.position,
    p_signature: payload.signature,
  });

export const getStats = () => rpc('get_public_stats', {});
export const adminLogin = (password) => rpc('admin_login', { p_password: clean(password) });
export const adminList = (password) => rpc('admin_list_full', { p_password: clean(password) });
export const adminSetPassword = (oldPw, newPw) => rpc('admin_set_password', { p_old: clean(oldPw), p_new: clean(newPw) });
