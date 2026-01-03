import Elysia, { t } from "elysia"
import { getGeoIPInfo, countryCodeToFlag, GeoIPInfo } from "@/lib/geoip"

/**
 * Service Elysia pour la géolocalisation IP
 */
export const geoipService = new Elysia({ prefix: "/geoip" })
    /**
     * Récupère les informations de géolocalisation pour une adresse IP
     */
    .get(
        "/:ip",
        async ({ params: { ip } }) => {
            const info = await getGeoIPInfo(ip)

            if (!info) {
                return {
                    success: false,
                    error: "Impossible de géolocaliser cette adresse IP",
                }
            }

            return {
                success: true,
                data: {
                    ...info,
                    flag: countryCodeToFlag(info.countryCode),
                },
            }
        },
        {
            params: t.Object({
                ip: t.String(),
            }),
            detail: {
                summary: "Géolocaliser une adresse IP",
                description: "Retourne les informations de pays pour une adresse IP donnée",
                tags: ["GeoIP"],
            },
        }
    )
    /**
     * Récupère les informations de géolocalisation pour plusieurs adresses IP
     */
    .post(
        "/batch",
        async ({ body }) => {
            const results: Record<string, (GeoIPInfo & { flag: string }) | null> = {}

            await Promise.all(
                body.ips.map(async (ip) => {
                    const info = await getGeoIPInfo(ip)
                    results[ip] = info
                        ? { ...info, flag: countryCodeToFlag(info.countryCode) }
                        : null
                })
            )

            return {
                success: true,
                data: results,
            }
        },
        {
            body: t.Object({
                ips: t.Array(t.String()),
            }),
            detail: {
                summary: "Géolocaliser plusieurs adresses IP",
                description: "Retourne les informations de pays pour plusieurs adresses IP",
                tags: ["GeoIP"],
            },
        }
    )
