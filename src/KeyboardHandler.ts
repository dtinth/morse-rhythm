export class KeyboardHandler {
  constructor(
    private delegate: {
      down: () => void;
      up: () => void;
    }
  ) {}
  private keysDown: string[] = [];
  private state = false;

  down(key: string) {
    this.keysDown = this.keysDown.filter((k) => k !== key);
    this.keysDown.push(key);
    while (this.keysDown.length > 2) {
      this.keysDown.shift();
    }
    this.check();
  }

  up(key: string) {
    this.keysDown = this.keysDown.filter((k) => k !== key);
    this.check();
  }

  private check() {
    const expectedState = this.keysDown.length % 2 === 1;
    if (this.state !== expectedState) {
      this.state = expectedState;
      if (this.state) {
        this.delegate.down();
      } else {
        this.delegate.up();
      }
    }
  }
}
