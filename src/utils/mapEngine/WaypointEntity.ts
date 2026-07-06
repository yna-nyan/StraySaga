import * as THREE from 'three';
import { BaseEntity } from './BaseEntity';
import { Waypoint } from '../../types';
import { createWaypointTextureCanvas } from '../mapHelpers';

export class WaypointEntity extends BaseEntity {
  public waypointData: Waypoint;
  private ringMesh: THREE.Mesh;
  private cardMesh: THREE.Mesh;
  private cardMat: THREE.MeshBasicMaterial;

  constructor(wp: Waypoint, textureLoader: THREE.TextureLoader) {
    // Coords are x, y in storyData.ts (where y maps to depth z)
    super(wp.x, wp.y);
    this.waypointData = wp;

    // Ring Geometry Base
    const ringGeo = new THREE.RingGeometry(1.8, 2.5, 24);
    const colorHex = wp.id === 'house' ? '#EF4444' : 
                     wp.id === 'rival' ? '#3B82F6' :
                     wp.id === 'pond' ? '#EAB308' :
                     wp.id === 'comrades' ? '#F97316' :
                     wp.id === 'food' ? '#22C55E' : '#A855F7';

    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.ringMesh.rotation.x = -Math.PI / 2;
    this.group.add(this.ringMesh);

    // Card Token
    const letter = wp.id === 'house' ? 'H' :
                   wp.id === 'rival' ? 'A' :
                   wp.id === 'pond' ? 'O' :
                   wp.id === 'comrades' ? 'B' :
                   wp.id === 'food' ? 'C' : 'D';

    const tokenCanvas = createWaypointTextureCanvas(letter, colorHex);
    const tokenTexture = new THREE.CanvasTexture(tokenCanvas);
    tokenTexture.colorSpace = THREE.SRGBColorSpace;

    const cardGeo = new THREE.PlaneGeometry(4.5, 4.5);
    this.cardMat = new THREE.MeshBasicMaterial({
      map: tokenTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    this.cardMesh = new THREE.Mesh(cardGeo, this.cardMat);
    this.cardMesh.position.y = 3.5; 
    this.group.add(this.cardMesh);

    // Backup image Loader
    if (wp.id !== 'house') {
      textureLoader.load(
        '/map/paw.png',
        (pawTex) => {
          if (pawTex.image && (pawTex.image.width > 1 || pawTex.image.naturalWidth > 1)) {
            pawTex.colorSpace = THREE.SRGBColorSpace;
            this.cardMat.map = pawTex;
            this.cardMat.needsUpdate = true;
          }
        }
      );
    }
  }

  public update(time: number): void {
    // Ring rotation
    this.ringMesh.rotation.z = time * 0.5;

    // Card floating and spinning
    this.cardMesh.position.y = 3.3 + Math.sin(time * 2.5 + this.x) * 0.4;
    this.cardMesh.rotation.y = time * 0.8;
  }
}
