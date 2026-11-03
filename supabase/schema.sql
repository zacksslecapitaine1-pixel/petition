-- Schéma appliqué au projet Supabase « petition-emploi-du-temps » (référence / reprise).
-- Après exécution, définir le mot de passe admin avec un hash bcrypt :
--   insert into app_private.admin_config (id, password_hash)
--   values (1, '<hash bcrypt $2a$...>') on conflict (id) do update set password_hash = excluded.password_hash;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists unaccent with schema extensions;
create schema if not exists app_private;

create table app_private.signatures (
  id uuid primary key default gen_random_uuid(),
  numero integer generated always as identity unique,
  filiere text not null check (filiere in ('ia_bigdata','dev_web')),
  nom text not null check (char_length(nom) between 2 and 60),
  prenom text not null check (char_length(prenom) between 2 and 80),
  position text not null check (position in ('pour','contre')),
  signature text not null check (char_length(signature) between 200 and 150000),
  identity_key text not null,
  created_at timestamptz not null default now(),
  constraint signatures_unique_person unique (filiere, identity_key)
);
alter table app_private.signatures enable row level security;

create table app_private.admin_config (
  id integer primary key check (id = 1),
  password_hash text not null,
  failed_attempts integer not null default 0,
  locked_until timestamptz
);
alter table app_private.admin_config enable row level security;

-- Fonctions : voir les migrations « petition_functions_core » du projet
-- (make_identity_key, check_admin, submit_signature, get_public_stats,
--  admin_login, admin_list, admin_set_password).

-- Migration « petition_genre_telephone » : colonnes genre ('homme'|'femme') et telephone ('+228XXXXXXXX'),
-- nouvelle submit_signature (7 paramètres), admin_list_full (avec genre et téléphone).
