import { Tilemaps } from "phaser";

class Plant {
    private indexes: number[];
    private currentIndex: number; 

    constructor({indexes}: {indexes: number[]}) {
        this.indexes = indexes;
        this.currentIndex = 0;
    }

    current() {
        return this.indexes[this.currentIndex];
    }

    evolve() {
        if(this.currentIndex >= this.indexes.length) {
            this.currentIndex = 0;
        }
        else {
            this.currentIndex++;
        }
    }

    clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    }
}

const green = new Plant({ indexes: [0, 1, 2, 3]});
const pink = new Plant({ indexes: [10, 11, 12, 13]});

function make_map(): Plant[][] {
    return [
        // columns!!!
        [green, green, green],
        [pink, pink, pink],
        [green, pink, green],
    ];
}

export class TileScreen extends Phaser.Scene {
    evolutionTimer?: Phaser.Time.TimerEvent;
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
            width: this.plantData.length,
            height: this.plantData[0].length,
            tileWidth: 32,
            tileHeight: 32,
        });

        const tileset = this.map.addTilesetImage('tiles', undefined, 32, 32);

        const plants = this.map.createBlankLayer('plants', tileset);
        plants.fill(0, 0, 0, this.map.width, this.map.height);

        this.plantData.forEach((column, x) => {
            column.forEach((cell, y) => {
                plants.getTileAt(x, y).index = cell.current();
            })
        });

        this.evolutionTimer = this.time.delayedCall(2000, this.evolve, [tileset, plants], this);
    }

    evolve(tileset: Tilemaps.Tileset, plants: Tilemaps.TilemapLayer) {
        if(this.map) {
            console.log("Evolution");
            const plant = this.plantData[1][1];
            plant.evolve();
            this.map.getTileAt(1, 1).index = plant.current();

            this.evolutionTimer = this.time.delayedCall(2000, this.evolve, [tileset, plants], this);
        }
    }
}