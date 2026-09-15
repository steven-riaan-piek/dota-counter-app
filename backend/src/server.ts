import { createServer } from "node:http";
import { getCounters } from "./dotabuff";
import { getCombinedCounters } from "./counter-service";

const server = createServer(async (req, res) => {
    const url = new URL(
        req.url ?? "/",
        `http://${req.headers.host}`
    );

// GET /api/team-counters?heroes=sven,invoker,lion
if (
    req.method === "GET" &&
    url.pathname === "/api/team-counters"
) {
    const heroesParam = url.searchParams.get("heroes");

    if (!heroesParam) {
        res.writeHead(400, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            error: "Heroes are required"
        }));

        return;
    }

    const enemyHeroes = heroesParam
        .split(",")
        .map((hero) => hero.trim().toLowerCase())
        .filter(Boolean);

    if (enemyHeroes.length === 0) {
        res.writeHead(400, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            error: "At least one hero is required"
        }));

        return;
    }

    try {
        console.log(
            `Getting counters for: ${enemyHeroes.join(", ")}`
        );

        const counters = await getCombinedCounters(enemyHeroes);

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            enemies: enemyHeroes,
            counters
        }));

    } catch (error) {
        console.error(error);

        res.writeHead(500, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            error: "Failed to get team counters"
        }));
    }

    return;
}

    // GET /api/counters/:hero
    if (
        req.method === "GET" &&
        url.pathname.startsWith("/api/counters/")
    ) {
        const heroSlug = url.pathname
            .replace("/api/counters/", "")
            .toLowerCase();

        if (!heroSlug) {
            res.writeHead(400, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                error: "Hero is required"
            }));

            return;
        }

        try {
            console.log(`Getting counters for ${heroSlug}...`);

            const counters = await getCounters(heroSlug);

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                hero: heroSlug,
                counters
            }));
        } catch (error) {
            console.error(error);

            res.writeHead(500, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                error: "Failed to get hero counters"
            }));
        }

        return;
    }

    // API status
    if (req.method === "GET" && url.pathname === "/") {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            message: "Dota Counter API is running!"
        }));

        return;
    }

    // Not found
    res.writeHead(404, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
        error: "Route not found"
    }));
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});