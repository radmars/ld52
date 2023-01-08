import {new_plant_tile, new_barn_tile, Barn, Plant, Tile} from './tiles';

const meat = new Plant({ timer: 500, indexes: [0, 1, 2, 3, 4, 5] });

type TileDefinitions = Record<string, () => Tile>;

const map_tiles: TileDefinitions = {
    g: (): Tile => {
        const tile = new_plant_tile(meat.clone());
        // tile.object.updateTimer(Math.random() * 20000 + 4000);
        tile.object.updateTimer(Math.random() * 1000 + 1100);
        return tile;
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
            if(builder) {
                return builder();
            }
            throw new Error(`Unknown cell: "${cell}"`);
        });
    });
}