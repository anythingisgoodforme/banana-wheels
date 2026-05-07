export class Obstacle {
  constructor({ laneIndex, z, kind, biome }) {
    this.type = 'obstacle';
    this.laneIndex = laneIndex;
    this.z = z;
    this.kind = kind;
    this.biome = biome;
    this.hit = false;
  }
}
