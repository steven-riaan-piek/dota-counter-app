import { prisma } from "./prisma";
import { getCounters, Counter } from "./dotabuff";

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const heroes = await prisma.hero.findMany({
        orderBy: { id: "asc" }
    });

    console.log(`Found ${heroes.length} heroes in database.`);

    let completed = 0;
    let failed = 0;
    let saved = 0;

    const failedHeroes: string[] = [];

    for (let i = 0; i < heroes.length; i++) {
        const hero = heroes[i];

        const existingCount = await prisma.heroMatchup.count({
            where: {
                heroId: hero.id
            }
        });

        if (existingCount >= 126) {
            console.log(
                `\n[${i + 1}/${heroes.length}] Skipping ${hero.name} (${existingCount} matchups already saved)`
            );
            completed++;
            continue;
        }

        console.log(`\n[${i + 1}/${heroes.length}] Importing ${hero.name}...`);

        let counters: Counter[] = [];

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                counters = await getCounters(hero.slug);

                if (counters.length > 0) {
                    break;
                }

                console.log(
                    `  No counters found. Retry ${attempt}/3...`
                );

                await sleep(5000);
            } catch (error) {
                console.log(
                    `  Attempt ${attempt}/3 failed. Retrying...`
                );

                await sleep(5000);
            }
        }

        if (counters.length === 0) {
            console.log(`FAILED: ${hero.name} returned 0 counters.`);
            failed++;
            failedHeroes.push(hero.name);
            continue;
        }

        console.log(`Found ${counters.length} counters.`);

        for (const counter of counters) {
            const counterHero = await prisma.hero.findFirst({
                where: {
                    name: {
                        equals: counter.hero,
                        mode: "insensitive"
                    }
                }
            });

            if (!counterHero) {
                continue;
            }

            await prisma.heroMatchup.upsert({
                where: {
                    heroId_counterHeroId: {
                        heroId: hero.id,
                        counterHeroId: counterHero.id
                    }
                },
                update: {
                    disadvantage: counter.disadvantage,
                    winRate: counter.heroWinRate,
                    matches: counter.matches
                },
                create: {
                    heroId: hero.id,
                    counterHeroId: counterHero.id,
                    disadvantage: counter.disadvantage,
                    winRate: counter.heroWinRate,
                    matches: counter.matches
                }
            });

            saved++;
        }

        completed++;

        console.log(`Completed ${hero.name}.`);

        await sleep(3000);
    }

    console.log("\n==============================");
    console.log("IMPORT COMPLETE");
    console.log("==============================");
    console.log(`Heroes completed: ${completed}`);
    console.log(`Heroes failed:    ${failed}`);
    console.log(`Matchups saved:   ${saved}`);

    if (failedHeroes.length > 0) {
        console.log("\nFailed heroes:");
        for (const hero of failedHeroes) {
            console.log(`- ${hero}`);
        }
    }
}

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });