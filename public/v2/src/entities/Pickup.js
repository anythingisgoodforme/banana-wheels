export class Pickup {
  constructor({ laneIndex, z, value = 1 }) {
    this.type = 'pickup';
    this.laneIndex = laneIndex;
    this.z = z;
    this.value = value;
    this.collected = false;
  }
}
