import { useState } from "react";
import "./App.css";

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
    const [enemyHeroes, setEnemyHeroes] = useState<string[]>([]);
    const [counters, setCounters] = useState<Counter[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function addHero() {
        const hero = heroInput.trim().toLowerCase();

        if (!hero) {
            return;
        }

        if (enemyHeroes.includes(hero)) {
            return;
        }

        setEnemyHeroes([...enemyHeroes, hero]);
        setHeroInput("");
    }

    function removeHero(hero: string) {
        setEnemyHeroes(
            enemyHeroes.filter((enemy) => enemy !== hero)
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
            const heroes = enemyHeroes.join(",");

            const response = await fetch(
    `/api/team-counters?heroes=${heroes}`
);

            if (!response.ok) {
                throw new Error("Failed to get counters.");
            }

            const data: CounterResponse = await response.json();

            setCounters(data.counters);
        } catch (error) {
            console.error(error);
            setError("Could not get counters from the backend.");
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

                    <input
                        type="text"
                        placeholder="Enter hero name..."
                        value={heroInput}
                        onChange={(event) =>
                            setHeroInput(event.target.value)
                        }
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                addHero();
                            }
                        }}
                    />

                    <button onClick={addHero}>
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
                                    key={hero}
                                >
                                    <span>{hero}</span>

                                    <button
                                        onClick={() =>
                                            removeHero(hero)
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
                    disabled={loading || enemyHeroes.length === 0}
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
                                .map((counter, index) => (
                                    <div
                                        className="counter-card"
                                        key={counter.hero}
                                    >
                                        <div className="rank">
                                            #{index + 1}
                                        </div>

                                        <div className="counter-info">
                                            <h3>
                                                {counter.hero}
                                            </h3>

                                            <p>
                                                Counters:{" "}
                                                {counter.against.join(
                                                    ", "
                                                )}
                                            </p>
                                        </div>

                                        <div className="score">
                                            {counter.score.toFixed(2)}
                                        </div>
                                    </div>
                                ))}

                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}

export default App;