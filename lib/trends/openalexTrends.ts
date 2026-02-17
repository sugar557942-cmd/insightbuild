import { OPENALEX_KEYWORDS } from "./openalexKeywords";

type Point = { year: number; count: number };

export async function buildOpenAlexTrends(refresh: boolean = false) {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5;
    const endYear = currentYear - 1;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

    const series = await Promise.all(
        OPENALEX_KEYWORDS.map(async (kw) => {
            // OpenAlex API: Works count by year
            // https://api.openalex.org/works?group_by=publication_year&filter=default.search:query
            const apiUrl = `https://api.openalex.org/works?group_by=publication_year&filter=default.search:${encodeURIComponent(kw.query)},publication_year:${startYear}-${endYear}`;

            let points: Point[] = [];
            try {
                const res = await fetch(apiUrl);
                if (res.ok) {
                    const data = await res.json();
                    // data.group_by is array of { key: "2023", count: 123 }
                    const countsByYear: Record<string, number> = {};
                    if (data.group_by) {
                        data.group_by.forEach((item: any) => {
                            countsByYear[item.key] = item.count;
                        });
                    }
                    points = years.map(y => ({
                        year: y,
                        count: countsByYear[y.toString()] || 0
                    }));
                } else {
                    console.error(`OpenAlex fetch failed for ${kw.key}: ${res.status}`);
                    points = years.map(y => ({ year: y, count: 0 }));
                }
            } catch (error) {
                console.error(`OpenAlex error for ${kw.key}:`, error);
                points = years.map(y => ({ year: y, count: 0 }));
            }

            return {
                key: kw.key,
                label: kw.label,
                topic: kw.topic,
                points
            };
        })
    );

    return {
        updatedAt: new Date().toISOString(),
        years,
        series
    };
}
