
import { format, Locale } from "date-fns";
import { enUS, fr } from "date-fns/locale";

const locales: Record<string, Locale> = {
    fr: fr,
};

const excludedPaths: readonly string[] = [
    "/verify-email/",
    "/login/",
    "/register/",
    "/search/",
    "/publish/",
    "/account/"
] as const;

export function excludePaths(pathname: string): boolean {
    const isPathExcluded: boolean = excludedPaths.some((path: string) =>
        pathname.startsWith(path)
    );
    return isPathExcluded;
}

export function formatDate(date: string | Date, dateLocale?: Locale | string, formatString?: string): string {
    let localeObj: Locale = fr;

    if (typeof dateLocale === 'string') {
        if (locales[dateLocale]) {
            localeObj = locales[dateLocale];
        }
    } else if (dateLocale) {
        localeObj = dateLocale;
    }

    return format(new Date(date), formatString || "PPP", {
        locale: localeObj,
    })
}

interface CategoryItem {
    id: number;
    name: string;
}

export function mapCategoriesToIds(
    rawCategories: (string | number)[],
    availableCategories: CategoryItem[]
): number[] {
    return rawCategories
        .map((cat: string | number) => {
            if (typeof cat === "number") return cat;
            const found: CategoryItem | undefined = availableCategories.find(
                (c: CategoryItem) => c.name === cat
            );
            return found ? found.id : undefined;
        })
        .filter((id): id is number => id !== undefined);
}

export function getCurrencySymbol(currency: string, locale: string = 'fr-FR'): string {
    if (!currency) return '';
    try {
        const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
        });
        const parts = formatter.formatToParts(0);
        const symbolPart = parts.find(part => part.type === 'currency');
        return symbolPart ? symbolPart.value : currency;
    } catch (e) {
        return currency;
    }
}

export function priceFormatter(value: number, currency: string, locale: string = 'fr-FR'): string {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
        }).format(value);
    } catch (e) {
        return `${value} ${currency}`;
    }
}
