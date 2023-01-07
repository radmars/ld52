import {new_plant_tile, new_barn_tile, Barn, Plant, Tile} from './tiles';

const green = new Plant({ timer: 2000, indexes: [0, 1, 2, 3] });
const pink = new Plant({ timer: 1000, indexes: [10, 11, 12, 13] });

export function build(): Tile[][] {
    let map = `
        ggggggggggppppppppppgpgpgpgpgppppppggggg
        ggggggggggppppppppppppppppppppgggggggggg
        ggggggggggpppppppppgggggggggggpppppppppp
        pgpgpgpgpgpgpgpgpgpgpgpgpgpgpgpgpgpgpgpg
        pppgggpppgggpppgggpppgggpppgggpppgggpppg
        gggggggggggggggggggggggggggggggggggggggg
        pppppppppppppppppppppppppppppppppppppppp
        pppppppppppppppppppppppppppppppppppppppp
        pppppppppppppppppppppppppppppppppppppppp
        pppppppppppppppppppppppppppppppppppppppp
        bppppppppppppppppppppppppppppppppppppppp
        gggggggggggggggggggggggggggggggggggggggg
        gggggggggggggggggggggggggggggggggggggggg
        pppppppppppppppppppppppppppppppppppppppp
        pppppppppppppppppppppppppppppppppppppppp
        gggggggggggggggggggggggggggggggggggggggg
        gggggggggggggggggggggggggggggggggggggggg
        pppppppppppppppppppppppppppppppppppppppp
        pppppppppppppppppppppppppppppppppppppppp
        gggggggggggggggggggggggggggggggggggggggg
        gggggggggggggggggggggggggggggggggggggggg
        gggggggggggggggggggggggggggggggggggggggg
        gggggggggggggggggggggggggggggggggggggggg
        gggggggggggggggggggggggggggggggggggggggg
        gggggggggggggggggggggggggggggggggggggggg
        gggggggggggggggggggggggggggggggggggggggg
        gggggggggggggggggggggggggggggggggggggggg
        gggggggggggggggggggggggggggggggggggggggg
        gggggggggggggggggggggggggggggggggggggggg
        gggggggggggggggggggggggggggggggggggggggg
        gggggggggggggggggggggggggggggggggggggggg
    `;
    map = map.replaceAll(/^\s*\n/gm, '')
        .replaceAll(/^\s*$/gm, '');
    const map_rows = map.split(/\n/);
    return map_rows.filter(row => row.length > 0).map(row => {
        row = row.replaceAll(/\s*/g, '');
        return row.split('').map((cell): Tile => {
            if (cell == 'g') {
                return new_plant_tile(green.clone());
            }
            else if (cell == 'p') {
                return new_plant_tile(pink.clone());
            }
            else if (cell == 'b') {
                return new_barn_tile(new Barn());
            }
            throw new Error(`Unknown cell: "${cell}"`);
        });
    });
}