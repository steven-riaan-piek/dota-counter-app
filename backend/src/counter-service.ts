import { prisma } from "./prisma";

export interface CombinedCounter {
    hero: string;
    score: number;
    against: string[];
}

export async function getCombinedCounters(
    enemyHeroes: string[]
): Promise<CombinedCounter[]> {

    const heroes = await prisma.hero.findMany({
        where: {
            slug: {
                in: enemyHeroes
            }
        },
        include: {
            matchups: {
                include: {
                    counterHero: true
                }
            }
        }
    });

    const counterMap = new Map<string, CombinedCounter>();

    for (const enemyHero of heroes) {

        for (const matchup of enemyHero.matchups) {

            const counterHero = matchup.counterHero;

            if (!counterMap.has(counterHero.slug)) {
                counterMap.set(counterHero.slug, {
                    hero: counterHero.name,
                    score: 0,
                    against: []
                });
            }

            const existing = counterMap.get(counterHero.slug)!;

            existing.score = Number(
                (existing.score + matchup.disadvantage).toFixed(2)
            );

            existing.against.push(enemyHero.name);
        }
    }

    return Array.from(counterMap.values())
        .sort((a, b) => b.score - a.score);
}