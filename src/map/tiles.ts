export const TILE_SIZE = 32;

export type Frame = number;

export interface BarnTile {
    type: 'barn';
    object: Barn;
}

export class Barn {
    current(): Frame {
        return 6;
    }
}

export function new_barn_tile(barn: Barn): BarnTile {
    return {
        type: 'barn',
        object: barn,
    };
}

export interface PlantTile {
    type: 'plant';
    object: Plant;
}

export function new_plant_tile(p: Plant): PlantTile {
    return {
        type: 'plant',
        object: p,
    };
}

export type Tile = PlantTile | BarnTile;

export interface PlantParams {
    indexes: number[];
    timer: number;
}

export class Plant {
    private indexes: Frame[];
    private currentIndex: number;
    private currentFrame: Frame;
    private timer: number | null;
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

    updateTimer(increment: number): void {
        this.timer = increment;
        this.timerIncrement = increment;
    }

    current(): number {
        return this.currentFrame;
    }

    resetTimer(): void {
        this.timer = this.timerIncrement;
    }

    /**
     * Returns true if the plant changed.
     */
    grow(dt: number): boolean {
        if (this.timer) {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.resetTimer();
                if (this.currentIndex >= this.indexes.length) {
                    this.timer = null;
                }
                else {
                    this.setIndex(this.currentIndex + 1);
                }
                return true;
            }
            return false;
        }
        return false;
    }

    setIndex(idx: number): void {
        this.currentIndex = idx;
        const currentFrame = this.indexes[this.currentIndex];
        if(currentFrame!= undefined) {
            this.currentFrame = currentFrame;
        }
    }

    harvest(): number {
        this.setIndex(0);
        
        this.resetTimer();
        return 10;
    }

    clone(): Plant {
        const proto = Object.getPrototypeOf(this) as object;
        return Object.assign(Object.create(proto), this) as Plant;
    }
}