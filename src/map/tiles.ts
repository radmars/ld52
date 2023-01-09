export const TILE_SIZE = 96;

export type Frame = number;

export interface PlantStage {
    infested_frames: Frame[],
    frames: Frame[],
    animation_time: number;
    stage_duration: number;
    value: number;
    terminal_stage: boolean;
}

export interface BarnTile {
    type: 'barn';
    object: Barn;
}

export class Barn {
    current(): Frame {
        return 900;
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

interface ImpassibleTile {
    type: 'impassible';
    object: ImpassibleTerrain;
}

export class ImpassibleTerrain {
    private frame: Frame;

    constructor(frame: Frame) {
        this.frame = frame;
    }

    current(): Frame {
        return this.frame;
    }
}

export function new_impassible_tile(frame: number): ImpassibleTile {
    return {
        type: 'impassible',
        object: new ImpassibleTerrain(frame),
    };
}

export type Tile = PlantTile | BarnTile | ImpassibleTile;

export interface PlantParams {
    stages: PlantStage[];
}

export class Plant {
    private stages: PlantStage[];
    private currentIndex: number;
    private currentStage: PlantStage;
    private timer: number;
    private infested: boolean;

    constructor({ stages }: PlantParams) {
        const currentStage = stages[0];

        if (currentStage == undefined) {
            throw new Error("Must have at least one frame indexed");
        }

        this.infested = false;
        this.stages = stages;
        this.currentIndex = 0;
        this.currentStage = currentStage;
        this.timer = 0;
    }

    canInfest(): boolean {
        return this.currentStage.infested_frames.length > 0;
    }

    infest(): void {
        if(this.canInfest()) {
            this.infested = true;
        }
    }

    isInfested(): boolean {
        return this.infested;
    }

    /*
    updateTimer(increment: number): void {
        this.timer = increment;
        this.timerIncrement = increment;
    }
    */

    isLastStage(): boolean {
        return this.currentStage.terminal_stage;
    }

    current(): number {
        // TODO ANIMATION???
        if(this.infested) {
            return this.currentStage.infested_frames[0] ?? 7;
        }
        return this.currentStage.frames[0] ?? 7;
    }

    /*
    resetTimer(): void {
        this.timer = this.timerIncrement;
    }
    */

    healthy(): boolean {
        return !this.infested;
    }

    /**
     * Returns true if the plant changed.
     */
    grow(dt: number): boolean {
        if (!this.currentStage.terminal_stage) {
            this.timer -= dt;
            if (this.timer <= 0) {
                const newStage = this.setStage(this.currentIndex + 1);

                if(newStage.terminal_stage) {
                    if(Math.random() * 100 > 98) {
                        this.infest();
                    }
                }
                return true;
            }
        }
        return false;
    }

    setStage(idx: number): PlantStage {
        this.currentIndex = idx;
        const currentFrame = this.stages[this.currentIndex];
        if(currentFrame != undefined) {
            this.currentStage = currentFrame;
            this.timer = this.currentStage.stage_duration;
        }
        return this.currentStage;
    }

    harvest(): number {
        const value = this.currentStage.value;
        this.setStage(0);
        return value;
    }

    clone(): Plant {
        const proto = Object.getPrototypeOf(this) as object;
        return Object.assign(Object.create(proto), this) as Plant;
    }
}