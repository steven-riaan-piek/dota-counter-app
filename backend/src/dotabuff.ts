import { chromium } from "playwright";

export interface Counter {
    hero: string;
    disadvantage: number;
    heroWinRate: number;
    matches: number;
}

export async function getCounters(heroSlug: string): Promise<Counter[]> {
    const browser = await chromium.launch({
        headless: false
    });

    try {
        const page = await browser.newPage();

        const url = `https://www.dotabuff.com/heroes/${heroSlug}/counters`;

        await page.goto(url, {
            waitUntil: "domcontentloaded"
        });

        await page.waitForTimeout(3000);

        const rows = await page.locator("table tbody tr").allInnerTexts();

        // First 10 rows are the two summary tables.
        // Remaining rows are the Matchups table.
        const matchupRows = rows.slice(10);

        const counters: Counter[] = matchupRows
            .map((row) => {
                const parts = row
                    .split(/\t|\n/)
                    .map((part) => part.trim())
                    .filter(Boolean);

                if (parts.length !== 4) {
                    return null;
                }

                return {
                    hero: parts[0],
                    disadvantage: parseFloat(
                        parts[1].replace("%", "")
                    ),
                    heroWinRate: parseFloat(
                        parts[2].replace("%", "")
                    ),
                    matches: parseInt(
                        parts[3].replace(/,/g, ""),
                        10
                    )
                };
            })
            .filter(
                (counter): counter is Counter =>
                    counter !== null
            );

        return counters;
    } finally {
        await browser.close();
    }
}