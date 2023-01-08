import {new_plant_tile, new_barn_tile, Barn, Plant, Tile} from './tiles';

const meat = new Plant({ timer: 2000, indexes: [0, 1, 2, 3] });

type TileDefinitions = Record<string, () => Tile>;

const map_tiles: TileDefinitions = {
    g: (): Tile => {
        return new_plant_tile(meat.clone());
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
            if(builder) {
                return builder();
            }
            throw new Error(`Unknown cell: "${cell}"`);
        });
    });
}