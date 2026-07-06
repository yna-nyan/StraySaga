export class InputManager {
  public keys: Record<string, boolean> = {};
  private onActionCallback?: () => void;

  constructor(onAction?: () => void) {
    this.onActionCallback = onAction;
  }

  public init(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    const keysToPrevent = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd', ' ', 'Enter'];
    if (keysToPrevent.includes(e.key)) {
      e.preventDefault();
    }

    const keyMap: Record<string, string> = {
      ArrowUp: 'up', w: 'up', W: 'up',
      ArrowDown: 'down', s: 'down', S: 'down',
      ArrowLeft: 'left', a: 'left', A: 'left',
      ArrowRight: 'right', d: 'right', D: 'right'
    };

    const mapped = keyMap[e.key];
    if (mapped) {
      this.keys[mapped] = true;
    }

    if ((e.key === ' ' || e.key === 'Enter') && this.onActionCallback) {
      this.onActionCallback();
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    const keyMap: Record<string, string> = {
      ArrowUp: 'up', w: 'up', W: 'up',
      ArrowDown: 'down', s: 'down', S: 'down',
      ArrowLeft: 'left', a: 'left', A: 'left',
      ArrowRight: 'right', d: 'right', D: 'right'
    };

    const mapped = keyMap[e.key];
    if (mapped) {
      this.keys[mapped] = false;
    }
  };
}
