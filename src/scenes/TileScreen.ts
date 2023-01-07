import { Tilemaps } from "phaser";

interface PlantParams {
    indexes: number[];
    timer: number;
}

class Plant {
    private indexes: number[];
    private currentIndex: number;
    private timer: number;
    private timerIncrement: number;

    constructor({ indexes, timer }: PlantParams) {
        this.indexes = indexes;
        this.currentIndex = 0;
        this.timer = timer;
        this.timerIncrement = timer;
    }

    current() {
        return this.indexes[this.currentIndex];
    }

    resetTimer() {
        this.timer = this.timerIncrement;
    }

    /**
     * Returns true if the plant evolved.
     */
    evolve(dt: number) {
        this.timer -= dt;
        if (this.timer <= 0) {
            this.resetTimer();
            if (this.currentIndex >= this.indexes.length) {
                this.currentIndex = 0;
            }
            else {
                this.currentIndex++;
            }
            return true;
        }
    }

    clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    }
}

const green = new Plant({ timer: 2000, indexes: [0, 1, 2, 3] });
const pink = new Plant({ timer: 1000, indexes: [10, 11, 12, 13] });

function make_map(): Plant[][] {
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
        return row.split('').map(cell => {
            if (cell == 'g') {
                return green.clone();
            }
            else if (cell == 'p') {
                return pink.clone();
            }
            throw new Error(`Unknown cell: "${cell}"`);
        });
    });
}

export class TileScreen extends Phaser.Scene {
    plantData: Plant[][];
    map?: Tilemaps.Tilemap;

    constructor() {
        super('TileScreen');
        this.plantData = make_map();
    }

    preload() {
        this.load.image('tiles', 'assets/tiles/tiles.png');
    }

    create() {
        this.map = this.make.tilemap({
            key: 'map',
            width: this.plantData[0].length,
            height: this.plantData.length,
            tileWidth: 32,
            tileHeight: 32,
        });

        const tileset = this.map.addTilesetImage('tiles', undefined, 32, 32);

        const plants = this.map.createBlankLayer('plants', tileset);
        plants.fill(0, 0, 0, this.map.width, this.map.height);

        this.updatePlantTiles();
    }

    updatePlantTiles() {
        if(this.map) {
            const layer = this.map.getLayerIndexByName("plants");
            const map = this.map;
            this.plantData.forEach((row, y) => {
                row.forEach((cell, x) => {
                    map.getTileAt(x, y, undefined, layer).index = cell.current();
                })
            });
        }
    }

    update(time: number, delta: number): void {
        let updated = false;
        this.plantData.forEach(row => {
            row.forEach(plant => {
                updated = plant.evolve(delta) || updated;
            });
        });

        if(updated) {
            this.updatePlantTiles();
        }
    }
}