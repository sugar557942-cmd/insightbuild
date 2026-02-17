import { buildOpenAlexTrends } from "../lib/trends/openalexTrends";

(async () => {
    console.log("Testing buildOpenAlexTrends...");
    try {
        const data = await buildOpenAlexTrends();
        if (data && data.series && data.series.length > 0) {
            console.log("Success! Data preview:");
            console.log(JSON.stringify(data.series[0], null, 2));
        } else {
            console.log("Returned empty data or structure mismatch.");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Error running buildOpenAlexTrends:", e);
    }
})();
