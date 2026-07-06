import * as THREE from 'three';
import { BaseEntity } from './BaseEntity';

export class PlayerEntity extends BaseEntity {
  public isMoving: boolean = false;
  public facingLeft: boolean = false;
  public bobTime: number = 0;

  private avatarPlane: THREE.Mesh;
  private footprints: { mesh: THREE.Mesh; age: number; maxLife: number }[] = [];
  private footprintGeo = new THREE.PlaneGeometry(1.6, 1.6);
  private distanceTraveled = 0;
  private lastCatX: number;
  private lastCatZ: number;
  private alternatePaw = false;
  private trailPawTex: THREE.Texture;

  constructor(x: number, z: number, avatarTexture: THREE.Texture) {
    super(x, z);
    this.lastCatX = x;
    this.lastCatZ = z;

    // Spawning 3D Player Base Group
    const baseGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.4, 16);
    const baseMat = new THREE.MeshStandardMaterial({
      color: '#4a3728',
      roughness: 0.8
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.2;
    this.group.add(baseMesh);

    // Spawn Player Avatar Plane
    const avatarGeo = new THREE.PlaneGeometry(4.0, 4.0);
    const avatarMat = new THREE.MeshBasicMaterial({
      map: avatarTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    this.avatarPlane = new THREE.Mesh(avatarGeo, avatarMat);
    this.avatarPlane.position.y = 2.2;
    this.group.add(this.avatarPlane);

    // Trail Paw Texture
    this.trailPawTex = this.createPlayerTrailPawTexture();
  }

  private createPlayerTrailPawTexture(): THREE.Texture {
    const pawCanvas = document.createElement('canvas');
    pawCanvas.width = 64;
    pawCanvas.height = 64;
    const pawCtx = pawCanvas.getContext('2d')!;
    pawCtx.fillStyle = '#2b1c11';
    
    pawCtx.beginPath();
    pawCtx.ellipse(32, 40, 14, 10, 0, 0, Math.PI * 2);
    pawCtx.fill();
    
    pawCtx.beginPath();
    pawCtx.arc(16, 26, 4.5, 0, Math.PI * 2); 
    pawCtx.arc(26, 17, 5, 0, Math.PI * 2);   
    pawCtx.arc(38, 17, 5, 0, Math.PI * 2);   
    pawCtx.arc(48, 26, 4.5, 0, Math.PI * 2); 
    pawCtx.fill();

    const tex = new THREE.CanvasTexture(pawCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  public update(time: number): void {
    // Coordinate position syncing is done from MapEngine
    this.group.position.set(this.x, 0, this.z);

    // Update bobbing animation
    if (this.isMoving) {
      this.bobTime += 0.25;
      this.avatarPlane.position.y = 2.2 + Math.sin(this.bobTime) * 0.15;
    } else {
      this.avatarPlane.position.y = 2.2 + Math.sin(time * 1.5) * 0.05;
    }

    // Direction and facing orientation updates
    this.avatarPlane.scale.x = this.facingLeft ? -1 : 1;
  }

  public updateTrail(scene: THREE.Scene): void {
    if (this.isMoving) {
      const dx = this.x - this.lastCatX;
      const dz = this.z - this.lastCatZ;
      const distStep = Math.sqrt(dx * dx + dz * dz);

      if (distStep > 0.01) {
        this.distanceTraveled += distStep;

        if (this.distanceTraveled >= 2.4) {
          this.distanceTraveled = 0;

          const angle = Math.atan2(dz, dx);
          const perpX = -Math.sin(angle);
          const perpZ = Math.cos(angle);

          const sideOffset = this.alternatePaw ? 0.45 : -0.45;
          this.alternatePaw = !this.alternatePaw;

          const fpX = this.x + (perpX * sideOffset) - (dx / distStep) * 0.6;
          const fpZ = this.z + (perpZ * sideOffset) - (dz / distStep) * 0.6;

          const fpMat = new THREE.MeshBasicMaterial({
            map: this.trailPawTex,
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
            side: THREE.DoubleSide
          });

          const fpMesh = new THREE.Mesh(this.footprintGeo, fpMat);
          fpMesh.position.set(fpX, 0.03, fpZ); 
          fpMesh.rotation.x = -Math.PI / 2;
          fpMesh.rotation.z = -angle - Math.PI / 2;

          scene.add(fpMesh);
          this.footprints.push({
            mesh: fpMesh,
            age: 0,
            maxLife: 160 
          });
        }
      }
    }

    this.lastCatX = this.x;
    this.lastCatZ = this.z;

    // Age and fade footprints
    for (let i = this.footprints.length - 1; i >= 0; i--) {
      const fp = this.footprints[i];
      fp.age += 1;
      const progress = fp.age / fp.maxLife;

      if (fp.mesh.material instanceof THREE.MeshBasicMaterial) {
        fp.mesh.material.opacity = (1 - progress) * 0.6;
      }

      if (fp.age >= fp.maxLife) {
        scene.remove(fp.mesh);
        if (fp.mesh.material instanceof THREE.Material) {
          fp.mesh.material.dispose();
        }
        this.footprints.splice(i, 1);
      }
    }
  }

  public override destroy(scene: THREE.Scene): void {
    super.destroy(scene);
    this.trailPawTex.dispose();
    this.footprintGeo.dispose();
    this.footprints.forEach((fp) => {
      scene.remove(fp.mesh);
      if (fp.mesh.material instanceof THREE.Material) {
        fp.mesh.material.dispose();
      }
    });
    this.footprints = [];
  }
}
