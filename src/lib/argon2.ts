import { hash, verify } from '@node-rs/argon2';

/**
 * Configuration optimale pour Argon2id selon les recommandations OWASP
 * - memoryCost: 19456 KiB (19 MiB) - mémoire utilisée
 * - timeCost: 2 - nombre d'itérations
 * - parallelism: 1 - nombre de threads parallèles
 */
const ARGON2_OPTIONS = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
};

/**
 * Hash un mot de passe avec Argon2id (variante recommandée)
 * @param password - Le mot de passe en clair à hasher
 * @returns Le hash du mot de passe (inclut salt et paramètres)
 */
export const hashPassword = async (password: string): Promise<string> => {
  return hash(password, ARGON2_OPTIONS);
};

/**
 * Vérifie qu'un mot de passe correspond au hash
 * @param data - Objet contenant le mot de passe et le hash
 * @param data.password - Le mot de passe en clair à vérifier
 * @param data.hash - Le hash stocké en base de données
 * @returns true si le mot de passe correspond, false sinon
 */
export const verifyPassword = async (data: {
  password: string;
  hash: string;
}): Promise<boolean> => {
  return verify(data.hash, data.password);
};
