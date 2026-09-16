import { prisma } from "./prisma";
import { getHeroes } from "./heroes";

async function main() {
    const heroes = await getHeroes();

    console.log(`Found ${heroes.length} heroes.`);

    for (const hero of heroes) {
        const savedHero = await prisma.hero.upsert({
            where: {
                slug: hero.slug
            },
            update: {
                name: hero.name,
                image: hero.image
            },
            create: {
                name: hero.name,
                slug: hero.slug,
                image: hero.image
            }
        });

        for (const alias of hero.aliases) {
            await prisma.heroAlias.upsert({
                where: {
                    alias
                },
                update: {
                    heroId: savedHero.id
                },
                create: {
                    alias,
                    heroId: savedHero.id
                }
            });
        }
    }

    console.log("Heroes seeded successfully!");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });