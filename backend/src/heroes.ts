import { prisma } from "./prisma";
export interface Hero {
    id: number;
    name: string;
    slug: string;
    aliases: string[];
    image: string;
}

interface OpenDotaHero {
    id: number;
    name: string;
    localized_name: string;
}

const aliases: Record<string, string[]> = {
    "Anti-Mage": ["am"],
    "Crystal Maiden": ["cm"],
    "Drow Ranger": ["drow"],
    "Earthshaker": ["es"],
    "Juggernaut": ["jugg"],
    "Shadow Fiend": ["sf"],
    "Phantom Lancer": ["pl"],
    "Puck": [],
    "Pudge": [],
    "Storm Spirit": ["storm"],
    "Sven": [],
    "Vengeful Spirit": ["vs", "venge"],
    "Windranger": ["wr"],
    "Zeus": [],
    "Kunkka": [],
    "Lina": [],
    "Lion": [],
    "Shadow Shaman": ["ss", "shaman"],
    "Tidehunter": ["tide"],
    "Witch Doctor": ["wd"],
    "Riki": [],
    "Sniper": [],
    "Spectre": ["spec"],
    "Templar Assassin": ["ta"],
    "Terrorblade": ["tb"],
    "Troll Warlord": ["troll"],
    "Ursa": [],
    "Venomancer": ["veno"],
    "Pangolier": ["pango"],
    "Phantom Assassin": ["pa"],
    "Nature's Prophet": ["np"],
    "Queen of Pain": ["qop"],
    "Timbersaw": ["timber"],
    "Monkey King": ["mk"],
    "Faceless Void": ["void"],
    "Night Stalker": ["ns"],
    "Keeper of the Light": ["kotl"],
    "Death Prophet": ["dp"],
    "Doom": [],
    "Lifestealer": ["naix"],
    "Dark Seer": ["ds"],
    "Necrophos": ["necro"],
    "Wraith King": ["wk"],
    "Ancient Apparition": ["aa"],
    "Elder Titan": ["et"],
    "Ember Spirit": ["ember"],
    "Earth Spirit": [],
    "Void Spirit": [],
    "Mars": [],
    "Snapfire": [],
    "Hoodwink": [],
    "Dawnbreaker": [],
    "Marci": [],
    "Muerta": [],
    "Ringmaster": []
};

function createSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/'/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
}

function normalize(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

let cachedHeroes: Hero[] | null = null;

export async function getHeroes(): Promise<Hero[]> {
    if (cachedHeroes) {
        return cachedHeroes;
    }

    const response = await fetch(
        "https://api.opendota.com/api/heroes"
    );

    if (!response.ok) {
        throw new Error("Failed to get heroes from OpenDota.");
    }

    const data: OpenDotaHero[] = await response.json();

    cachedHeroes = data.map((hero) => {
    const slug = createSlug(hero.localized_name);

    const imageSlug = hero.name.replace(
        "npc_dota_hero_",
        ""
    );

    return {
        id: hero.id,
        name: hero.localized_name,
        slug,
        aliases: aliases[hero.localized_name] ?? [],
        image:
            `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${imageSlug}.png`
    };
});

    return cachedHeroes;
}

export async function findHero(
    input: string
): Promise<Hero | undefined> {

    const search = normalize(input);

    const hero = await prisma.hero.findFirst({
        where: {
            OR: [
                {
                    name: {
                        equals: input,
                        mode: "insensitive"
                    }
                },
                {
                    slug: {
                        equals: input,
                        mode: "insensitive"
                    }
                },
                {
                    aliases: {
                        some: {
                            alias: {
                                equals: input,
                                mode: "insensitive"
                            }
                        }
                    }
                }
            ]
        },
        include: {
            aliases: true
        }
    });

    if (!hero) {
        return undefined;
    }

    return {
        id: hero.id,
        name: hero.name,
        slug: hero.slug,
        aliases: hero.aliases.map(
            (alias) => alias.alias
        ),
        image: hero.image
    };
}