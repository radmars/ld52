import { Tilemaps } from "phaser";
import { WINDOW_CENTER } from "../constants";

const TILE_SIZE = 32;

type Frame = number;

interface BarnTile {
    type: 'barn';
    object: Barn;
}

class Barn {
    current(): Frame {
        return 20;
    }
}

function new_barn_tile(barn: Barn): BarnTile {
    return {
        type: 'barn',
        object: barn,
    };
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

type Tile = PlantTile | BarnTile;

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

export class TileScreen extends Phaser.Scene {
    tiles: Tile[][];
    map?: Tilemaps.Tilemap;
    harvester?: Phaser.GameObjects.Image;

    constructor() {
        super('TileScreen');
        this.tiles = make_map();
    }

    preload(): void {
        this.load.image('tiles', 'assets/tiles/tiles.png');
        this.load.image('einstein', 'assets/harvester.png');
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

        const harvester = this.add.image(WINDOW_CENTER.x, WINDOW_CENTER.y, 'harvester');
        this.harvester = harvester;

        const tileset = this.map.addTilesetImage('tiles', undefined, 32, 32);

        const plants = this.map.createBlankLayer('plants', tileset);
        plants.fill(0, 0, 0, this.map.width, this.map.height);

        this.cameras.main.setBounds(0, 0, TILE_SIZE * this.map.width, TILE_SIZE * this.map.height);
        // Set Deadzone for harvester?
        this.cameras.main.startFollow(this.harvester);

        this.updateTiles();
        this.input.keyboard.on('keydown-RIGHT', () => {
            harvester.x += 3;
        });

        this.input.keyboard.on('keydown-LEFT', () => {
            harvester.x -= 3;
        });

        this.input.keyboard.on('keydown-DOWN', () => {
            harvester.y += 3;
        });

        this.input.keyboard.on('keydown-UP', () => {
            harvester.y -= 3;
            console.log('right up!');
        });
    }

    updateTiles(): void {
        if (this.map) {
            const layer = this.map.getLayer("plants")
                .tilemapLayer;
            this.tiles.forEach((row, y) => {
                row.forEach((tile, x) => {
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