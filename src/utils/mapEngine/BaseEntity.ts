import * as THREE from 'three';

export abstract class BaseEntity {
  public x: number;
  public z: number;
  public group: THREE.Group;

  constructor(x: number, z: number) {
    this.x = x;
    this.z = z;
    this.group = new THREE.Group();
    this.group.position.set(x, 0.1, z);
  }

  public abstract update(time: number): void;

  public destroy(scene: THREE.Scene): void {
    scene.remove(this.group);
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }
}
