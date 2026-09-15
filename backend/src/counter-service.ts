import { getCounters, Counter } from "./dotabuff";

export interface CombinedCounter {
    hero: string;
    score: number;
    against: string[];
}

export async function getCombinedCounters(
    enemyHeroes: string[]
): Promise<CombinedCounter[]> {

    const results = await Promise.all(
        enemyHeroes.map((hero) => getCounters(hero))
    );

    const counterMap = new Map<string, CombinedCounter>();

    for (let i = 0; i < results.length; i++) {

        const counters: Counter[] = results[i];
        const enemyHero = enemyHeroes[i];

        for (const counter of counters) {

            if (!counterMap.has(counter.hero)) {
                counterMap.set(counter.hero, {
                    hero: counter.hero,
                    score: 0,
                    against: []
                });
            }

            const existing = counterMap.get(counter.hero)!;

            existing.score = Number(
    (existing.score + counter.disadvantage).toFixed(2)
);

            existing.against.push(enemyHero);
        }
    }

    return Array.from(counterMap.values())
        .sort((a, b) => b.score - a.score);
}