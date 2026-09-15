import { useEffect, useState } from "react";
import "./App.css";

interface Hero {
    id: number;
    name: string;
    slug: string;
    aliases: string[];
    image: string;
}

interface Counter {
    hero: string;
    score: number;
    against: string[];
}

interface CounterResponse {
    enemies: string[];
    counters: Counter[];
}

function App() {
    const [heroInput, setHeroInput] = useState("");
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [enemyHeroes, setEnemyHeroes] = useState<Hero[]>([]);
    const [counters, setCounters] = useState<Counter[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadHeroes() {
            try {
                const response = await fetch("/api/heroes");

                if (!response.ok) {
                    throw new Error("Failed to load heroes.");
                }

                const data: Hero[] = await response.json();

                setHeroes(data);
            } catch (error) {
                console.error(error);
                setError("Could not load hero data.");
            }
        }

        loadHeroes();
    }, []);

    const search = heroInput.trim().toLowerCase();

    const suggestions = search
        ? heroes
            .filter((hero) => {
                const name = hero.name.toLowerCase();
                const slug = hero.slug.toLowerCase();

                const matchesName = name.includes(search);
                const matchesSlug = slug.includes(search);

                const matchesAlias = hero.aliases.some(
                    (alias) =>
                        alias.toLowerCase().includes(search)
                );

                return (
                    matchesName ||
                    matchesSlug ||
                    matchesAlias
                );
            })
            .filter(
                (hero) =>
                    !enemyHeroes.some(
                        (enemy) => enemy.slug === hero.slug
                    )
            )
            .slice(0, 6)
        : [];

    function addHero(hero: Hero) {
        if (
            enemyHeroes.some(
                (enemy) => enemy.slug === hero.slug
            )
        ) {
            return;
        }

        setEnemyHeroes([
            ...enemyHeroes,
            hero
        ]);

        setHeroInput("");
        setError("");
    }

    function addTypedHero() {
        const input = heroInput.trim();

        if (!input) {
            return;
        }

        const exactHero = heroes.find((hero) => {
            const searchValue = input.toLowerCase();

            return (
                hero.name.toLowerCase() === searchValue ||
                hero.slug.toLowerCase() === searchValue ||
                hero.aliases.some(
                    (alias) =>
                        alias.toLowerCase() === searchValue
                )
            );
        });

        if (!exactHero) {
            setError(`Hero not found: ${input}`);
            return;
        }

        addHero(exactHero);
    }

    function removeHero(slug: string) {
        setEnemyHeroes(
            enemyHeroes.filter(
                (hero) => hero.slug !== slug
            )
        );
    }

    function findHeroByName(name: string) {
        return heroes.find(
            (hero) =>
                hero.name.toLowerCase() ===
                name.toLowerCase()
        );
    }

    async function findCounters() {
        if (enemyHeroes.length === 0) {
            setError("Add at least one enemy hero.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const heroSlugs = enemyHeroes
                .map((hero) => hero.slug)
                .join(",");

            const response = await fetch(
                `/api/team-counters?heroes=${heroSlugs}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to get counters."
                );
            }

            const data: CounterResponse =
                await response.json();

            setCounters(data.counters);
        } catch (error) {
            console.error(error);

            setError(
                "Could not get counters from the backend."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="app">
            <div className="container">

                <h1>Dota 2 Counter Picker</h1>

                <p className="subtitle">
                    Enter the enemy heroes to find the best counters.
                </p>

                <div className="input-section">

                    <div className="search-box">

                        <input
                            type="text"
                            placeholder="Search hero or shorthand..."
                            value={heroInput}
                            onChange={(event) =>
                                setHeroInput(
                                    event.target.value
                                )
                            }
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    addTypedHero();
                                }
                            }}
                        />

                        {suggestions.length > 0 && (
                            <div className="suggestions">

                                {suggestions.map((hero) => (
                                    <button
                                        key={hero.slug}
                                        className="suggestion"
                                        onClick={() =>
                                            addHero(hero)
                                        }
                                    >
                                        <img
                                            src={hero.image}
                                            alt={hero.name}
                                        />

                                        <span>
                                            {hero.name}
                                        </span>

                                        {hero.aliases.length > 0 && (
                                            <small>
                                                {hero.aliases
                                                    .slice(0, 2)
                                                    .join(", ")}
                                            </small>
                                        )}
                                    </button>
                                ))}

                            </div>
                        )}

                    </div>

                    <button
                        onClick={addTypedHero}
                    >
                        Add Hero
                    </button>

                </div>

                <div className="enemy-section">

                    <h2>Enemy Heroes</h2>

                    {enemyHeroes.length === 0 ? (
                        <p className="empty">
                            No enemy heroes selected.
                        </p>
                    ) : (
                        <div className="hero-list">

                            {enemyHeroes.map((hero) => (
                                <div
                                    className="hero-tag"
                                    key={hero.slug}
                                >
                                    <img
                                        src={hero.image}
                                        alt={hero.name}
                                    />

                                    <span>
                                        {hero.name}
                                    </span>

                                    <button
                                        onClick={() =>
                                            removeHero(
                                                hero.slug
                                            )
                                        }
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}

                        </div>
                    )}

                </div>

                <button
                    className="counter-button"
                    onClick={findCounters}
                    disabled={
                        loading ||
                        enemyHeroes.length === 0
                    }
                >
                    {loading
                        ? "Finding Counters..."
                        : "Find Counters"}
                </button>

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

                {counters.length > 0 && (
                    <div className="results">

                        <h2>Best Counters</h2>

                        <div className="counter-list">

                            {counters
                                .slice(0, 10)
                                .map(
                                    (
                                        counter,
                                        index
                                    ) => {
                                        const hero =
                                            findHeroByName(
                                                counter.hero
                                            );

                                        return (
                                            <div
                                                className="counter-card"
                                                key={
                                                    counter.hero
                                                }
                                            >

                                                {hero && (
                                                    <img
                                                        className="counter-image"
                                                        src={
                                                            hero.image
                                                        }
                                                        alt={
                                                            hero.name
                                                        }
                                                    />
                                                )}

                                                <div className="rank">
                                                    #{index + 1}
                                                </div>

                                                <div className="counter-info">

                                                    <h3>
                                                        {
                                                            counter.hero
                                                        }
                                                    </h3>

                                                    <p>
                                                        Counters:{" "}
                                                        {counter.against.join(
                                                            ", "
                                                        )}
                                                    </p>

                                                </div>

                                                <div className="score">
                                                    {counter.score.toFixed(
                                                        2
                                                    )}
                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}

export default App;