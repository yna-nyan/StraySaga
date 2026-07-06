import * as THREE from 'three';
import { BaseEntity } from './BaseEntity';

export interface TreatEncounter {
  id: string;
  name: 'tuna' | 'kibble';
  x: number;
  z: number;
  energyValue: number;
  effectLabel: string;
}

export class TreatEntity extends BaseEntity {
  public treatData: TreatEncounter;
  private standeeMesh: THREE.Mesh;
  private treatPawTex: THREE.Texture;

  constructor(treat: TreatEncounter) {
    super(treat.x, treat.z);
    this.treatData = treat;

    // Glowing base circle shadow
    const shadowGeo = new THREE.RingGeometry(0, 1.5, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: '#D97706',
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    this.group.add(shadowMesh);

    // Treat Paw Texture
    this.treatPawTex = this.createTreatPawTexture();

    // Distinct Pawprint Standee mesh to identify treats visually on map
    const standeeGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const standeeMat = new THREE.MeshBasicMaterial({
      map: this.treatPawTex,
      transparent: true,
      side: THREE.DoubleSide
    });
    this.standeeMesh = new THREE.Mesh(standeeGeo, standeeMat);
    this.standeeMesh.position.y = 2.0;
    this.group.add(this.standeeMesh);
  }

  private createTreatPawTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = '#D97706'; // Golden amber color for treat paw prints
    
    // Main Pad
    ctx.beginPath();
    ctx.ellipse(32, 40, 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 4 Toes
    ctx.beginPath();
    ctx.arc(18, 26, 4, 0, Math.PI * 2);
    ctx.arc(27, 18, 4.5, 0, Math.PI * 2);
    ctx.arc(37, 18, 4.5, 0, Math.PI * 2);
    ctx.arc(46, 26, 4, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  public update(time: number): void {
    this.standeeMesh.position.y = 1.8 + Math.sin(time * 3.5 + this.x) * 0.2;
    this.standeeMesh.rotation.y = time * 1.2;
  }

  public override destroy(scene: THREE.Scene): void {
    super.destroy(scene);
    this.treatPawTex.dispose();
  }
}
