import maxmind, { CountryResponse, Reader } from "maxmind"
import path from "path"

// Cache pour le reader MaxMind (singleton)
let reader: Reader<CountryResponse> | null = null

/**
 * Initialise le reader MaxMind GeoLite2
 * Le fichier GeoLite2-Country.mmdb doit être placé dans le dossier data/
 */
const getReader = async (): Promise<Reader<CountryResponse> | null> => {
    if (reader) return reader

    try {
        const dbPath = path.join(process.cwd(), "data", "GeoLite2-Country.mmdb")
        reader = await maxmind.open<CountryResponse>(dbPath)
        return reader
    } catch (error) {
        console.error("Erreur lors de l'initialisation de MaxMind GeoLite2:", error)
        return null
    }
}

/**
 * Interface pour les informations de géolocalisation
 */
export interface GeoIPInfo {
    country: string | null
    countryCode: string | null
    continent: string | null
    continentCode: string | null
}

/**
 * Récupère les informations de géolocalisation à partir d'une adresse IP
 * @param ip - Adresse IP à géolocaliser
 * @returns Informations de géolocalisation ou null si non trouvé
 */
export const getGeoIPInfo = async (ip: string): Promise<GeoIPInfo | null> => {
    // Ignorer les IPs locales
    if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
        return {
            country: "Local",
            countryCode: "LOCAL",
            continent: null,
            continentCode: null,
        }
    }

    const readerInstance = await getReader()

    // Si pas de base locale, utiliser le fallback API
    if (!readerInstance) {
        return await fetchFromFallback(ip)
    }

    try {
        const result = readerInstance.get(ip)
        if (!result) return null

        return {
            country: result.country?.names?.fr || result.country?.names?.en || null,
            countryCode: result.country?.iso_code || null,
            continent: result.continent?.names?.fr || result.continent?.names?.en || null,
            continentCode: result.continent?.code || null,
        }
    } catch (error) {
        console.error(`Erreur lors de la géolocalisation de l'IP ${ip}:`, error)
        return fetchFromFallback(ip) // Tenter le fallback aussi en cas d'erreur de lecture
    }
}

/**
 * Fallback utilisant une API publique gratuite (ip-api.com)
 * Attention: Limité à 45 requêtes / minute
 */
const fetchFromFallback = async (ip: string): Promise<GeoIPInfo | null> => {
    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,continent,continentCode`)
        const data = await response.json()

        if (data.status !== 'success') return null

        return {
            country: data.country,
            countryCode: data.countryCode,
            continent: data.continent,
            continentCode: data.continentCode
        }
    } catch (error) {
        // Silently fail if fallback also fails
        return null
    }
}

/**
 * Récupère le code pays ISO à partir d'une adresse IP
 * @param ip - Adresse IP
 * @returns Code pays ISO (ex: "FR", "US") ou null
 */
export const getCountryCode = async (ip: string): Promise<string | null> => {
    const info = await getGeoIPInfo(ip)
    return info?.countryCode || null
}

/**
 * Récupère le nom du pays à partir d'une adresse IP
 * @param ip - Adresse IP
 * @returns Nom du pays ou null
 */
export const getCountryName = async (ip: string): Promise<string | null> => {
    const info = await getGeoIPInfo(ip)
    return info?.country || null
}

/**
 * Mapping des codes pays vers les emojis de drapeaux
 */
export const countryCodeToFlag = (countryCode: string | null): string => {
    if (!countryCode || countryCode === "LOCAL") return "🏠"

    // Convertir le code pays en emoji drapeau
    // Les drapeaux sont représentés par deux caractères régionaux Unicode
    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0))

    return String.fromCodePoint(...codePoints)
}
