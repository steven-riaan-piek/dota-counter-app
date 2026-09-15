import { getCounters } from "./dotabuff";

async function test() {
    const counters = await getCounters("invoker");

    console.log("Number of counters:", counters.length);

    console.log("Top 10 Sven counters:");

    console.log(counters.slice(0, 10));
}

test();