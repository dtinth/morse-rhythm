export class UpdateTracker {
  count = 0;
  setTarget(count: number, callback: () => void) {
    while (this.count < count) {
      this.count++;
      callback();
    }
  }
}
