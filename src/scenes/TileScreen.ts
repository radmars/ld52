import { Tilemaps } from "phaser";

type Frame = number;

class Barn {
    current(): Frame {
        return 20;
    }
}

interface PlantTile {
    type: 'plant';
    object: Plant;
}

function new_plant_tile(p: Plant): PlantTile {
    return {
        type: 'plant',
        object: p,
    };
}

type Tile = PlantTile
    | { type: 'barn', object: Barn };

interface PlantParams {
    indexes: number[];
    timer: number;
}

class Plant {
    private indexes: Frame[];
    private currentIndex: number;
    private currentFrame: Frame;
    private timer: number;
    private timerIncrement: number;

    constructor({ indexes, timer }: PlantParams) {
        const currentFrame = indexes[0];

        if (currentFrame == undefined) {
            throw new Error("Must have at least one frame indexed");
        }

        this.indexes = indexes;
        this.currentIndex = 0;
        this.timer = timer;
        this.timerIncrement = timer;
        this.currentFrame = currentFrame;
    }

    current(): number {
        return this.currentFrame;
    }

    resetTimer(): void {
        this.timer = this.timerIncrement;
    }

    /**
     * Returns true if the plant evolved.
     */
    evolve(dt: number): boolean {
        this.timer -= dt;
        if (this.timer <= 0) {
            this.resetTimer();
            if (this.currentIndex >= this.indexes.length) {
                this.currentIndex = 0;
            }
            else {
                this.currentIndex++;
            }

            const currentFrame = this.indexes[this.currentIndex];
            if(currentFrame != undefined) {
                this.currentFrame = currentFrame;
            }
            return true;
        }
        return false;
    }

    clone(): Plant {
        const proto = Object.getPrototypeOf(this) as object;
        return Object.assign(Object.create(proto), this) as Plant;
    }
}

const green = new Plant({ timer: 2000, indexes: [0, 1, 2, 3] });
const pink = new Plant({ timer: 1000, indexes: [10, 11, 12, 13] });

function make_map(): Tile[][] {
    let map = `
        ggggggggggppppppppppgpgpgpgpgppppppggggg
        ggggggggggppppppppppppppppppppgggggggggg
        ggggggggggpppppppppgggggggggggpppppppppp
        pgpgpgpgpgpgpgpgpgpgpgpgpgpgpgpgpgpgpgpg
        pppgggpppgggpppgggpppgggpppgggpppgggpppg
        gggggggggggggggggggggggggggggggggggggggg
        pppppppppppppppppppppppppppppppppppppppp
        pppppppppppppppppppppppppppppppppppppppp
        gggggggggggggggggggggggggggggggggggggggg
        gggggggggggggggggggggggggggggggggggggggg
        pppppppppppppppppppppppppppppppppppppppp
        pppppppppppppppppppppppppppppppppppppppp
        gggggggggggggggggggggggggggggggggggggggg
        gggggggggggggggggggggggggggggggggggggggg
        pppppppppppppppppppppppppppppppppppppppp
        pppppppppppppppppppppppppppppppppppppppp
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
            throw new Error(`Unknown cell: "${cell}"`);
        });
    });
}

export class TileScreen extends Phaser.Scene {
    tiles: Tile[][];
    map?: Tilemaps.Tilemap;

    constructor() {
        super('TileScreen');
        this.tiles = make_map();
    }

    preload(): void {
        this.load.image('tiles', 'assets/tiles/tiles.png');
    }

    create(): void {
        const first_row = this.tiles[0];
        if (!first_row) {
            throw new Error("Must have failed to parse map!");
        }

        this.map = this.make.tilemap({
            key: 'map',
            width: first_row.length,
            height: this.tiles.length,
            tileWidth: 32,
            tileHeight: 32,
        });

        const tileset = this.map.addTilesetImage('tiles', undefined, 32, 32);

        const plants = this.map.createBlankLayer('plants', tileset);
        plants.fill(0, 0, 0, this.map.width, this.map.height);

        this.updateTiles();
    }

    updateTiles(): void {
        if (this.map) {
            const layer = this.map.getLayer("plants")
                .tilemapLayer;
            this.tiles.forEach((row, y) => {
                row.forEach((tile, x) => {
                    console.log("D");
                    layer.getTileAt(x, y).index = tile.object.current();
                });
            });
        }
    }

    override update(time: number, delta: number): void {
        super.update(time, delta);

        let updated = false;
        for (const row of this.tiles) {
            for (const tile of row) {
                if (tile.type == 'plant') {
                    if (tile.object.evolve(delta)) {
                        updated = true;
                    }
                }
            }
        }

        if (updated) {
            this.updateTiles();
        }
    }
}