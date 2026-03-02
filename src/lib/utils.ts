import z from "zod";

export const generateBase64Token = (length = 128) => {
    const randomBytes = crypto.getRandomValues(new Uint8Array(length));
    const token = btoa(String.fromCharCode(...randomBytes));
    return token;
};

export const capitalizeString = (str: string) => {
    return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

export const catchError = <T>(
    promise: Promise<T>,
): Promise<[undefined, T] | [Error]> => {
    return promise
        .then((data) => [undefined, data] as [undefined, T])
        .catch((error) => {
            if (error instanceof Error) {
                return [error];
            }
            return [new Error(error as string)];
        });
};

export const uuid = (name: string = "Id") => z.uuid(`${name} is not a uuid`);

export function generateRandomName() {
    if (Math.random() < 0.000001) {
        return "ten-gallon-wiener-pure-beef";
    }

    const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

    const adjectives = [
        "sussy",
        "wacky",
        "crazy",
        "lazy",
        "cool",
        "angry",
        "sneaky",
        "happy",
        "funky",
        "weird",
        "bouncy",
        "spooky",
        "drippy",
        "sus",
        "goofy",
        "zany",
        "slimy",
        "cringe",
        "epic",
        "odd",
        "cursed",
        "wild",
        "toxic",
        "icy",
        "burnt",
        "loud",
        "silent",
        "mega",
        "ultra",
        "rusty",
        "hollow",
    ];

    const nouns = [
        "man",
        "cat",
        "dog",
        "robot",
        "goblin",
        "wizard",
        "alien",
        "noob",
        "gamer",
        "banana",
        "skeleton",
        "troll",
        "pickle",
        "crewmate",
        "nugget",
        "duck",
        "mango",
        "pirate",
        "ghost",
        "llama",
        "chimp",
        "toast",
        "clown",
        "waffle",
        "zombie",
        "bean",
        "sock",
        "blob",
        "dude",
        "thing",
    ];

    const places = [
        "castle",
        "tower",
        "bunker",
        "hut",
        "spaceship",
        "cave",
        "lair",
        "dimension",
        "realm",
        "dungeon",
        "fort",
        "vault",
        "island",
        "lab",
        "void",
        "portal",
        "dojo",
        "subway",
        "fridge",
        "barn",
        "zone",
        "base",
        "arena",
        "ship",
        "hall",
    ];

    const extras = [
        "deluxe",
        "prime",
        "v2",
        "9000",
        "redux",
        "mk2",
        "pro",
        "x",
        "beta",
        "max",
        "zero",
        "edge",
        "one",
        "mini",
        "plus",
        "clone",
        "meta",
    ];

    const name = [pick(adjectives), pick(nouns), pick(places)];
    if (Math.random() < 0.3) name.push(pick(extras));
    if (Math.random() < 0.001) name.push("lucky");

    return name.join("-");
}
