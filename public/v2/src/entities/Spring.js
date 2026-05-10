export class Spring {
  constructor({ laneIndex, z }) {
    this.type = 'spring';
    this.laneIndex = laneIndex;
    this.z = z;
    this.used = false;
  }
}
