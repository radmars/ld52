import { new_plant_tile, new_barn_tile, Barn, Plant, Tile, PlantStage } from './tiles';

const meat_stages: PlantStage[] = [ 
    {
        frames: [0],
        flashing: false,
        animation_time: 100,
        stage_duration: 1000,
        terminal_stage: false,
        infested: false,
        value: 1,
    },
    {
        frames: [1],
        flashing: false,
        animation_time: 100,
        stage_duration: 1000,
        terminal_stage: false,
        infested: false,
        value: 2,
    },
    {
        frames: [2],
        flashing: false,
        animation_time: 100,
        stage_duration: 1000,
        terminal_stage: false,
        infested: false,
        value: 5,
    },
    {
        frames: [3],
        flashing: false,
        animation_time: 100,
        stage_duration: 1000,
        terminal_stage: false,
        infested: false,
        value: 10,
    },
    // the good shit
    {
        frames: [4],
        flashing: false,
        animation_time: 100,
        stage_duration: 5000,
        terminal_stage: false,
        infested: false,
        value: 100,
    },
    // expired
    {
        frames: [5],
        flashing: false,
        animation_time: 100,
        // doesn't matter...
        stage_duration: 0,
        terminal_stage: true,
        infested: false,
        value: 0,
    },
    // infested
    {
        frames: [8],
        flashing: false,
        animation_time: 100,
        stage_duration: 1000,
        terminal_stage: false,
        infested: true,
        value: 1,
    }
];

function random_mutation_10(input: number): number {
    return input + Math.random() * .2 * input + .1 * input;
}

type TileDefinitions = Record<string, () => Tile>;

const map_tiles: TileDefinitions = {
    g: (): Tile => {
        const stages = meat_stages.map((stage) => {
            return {
                ...stage,
                stage_duration: random_mutation_10(stage.stage_duration),
            };
        });
        const plant = new Plant({ stages });
        return new_plant_tile(plant);
    },

    b: (): Tile => {
        return new_barn_tile(new Barn());
    }
};

export function build(): Tile[][] {
    let map = `
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        bbggggggggggggggggggggggggggggggggggggggg
        bbggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
        ggggggggggggggggggggggggggggggggggggggggg
    `;
    map = map.replaceAll(/^\s*\n/gm, '')
        .replaceAll(/^\s*$/gm, '');
    const map_rows = map.split(/\n/);
    return map_rows.filter(row => row.length > 0).map(row => {
        row = row.replaceAll(/\s*/g, '');
        return row.split('').map((cell): Tile => {
            const builder = map_tiles[cell];
            if (builder) {
                return builder();
            }
            throw new Error(`Unknown cell: "${cell}"`);
        });
    });
}