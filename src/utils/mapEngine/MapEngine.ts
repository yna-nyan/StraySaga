import * as THREE from 'three';
import { CatStatus, Waypoint } from '../../types';
import { WAYPOINTS } from '../../data/storyData';
import { InputManager } from './InputManager';
import { PlayerEntity } from './PlayerEntity';
import { WaypointEntity } from './WaypointEntity';
import { TreatEntity, TreatEncounter } from './TreatEntity';
import { BaseEntity } from './BaseEntity';
import { audio } from '../audio';
import { drawProceduralMapCanvas, createCatTextureCanvas } from '../mapHelpers';

export interface MapEngineCallbacks {
  onVisitWaypoint: (wp: Waypoint) => void;
  onCollectTreat: (item: { id: string; name: string; effectLabel: string; energy: number }) => void;
  onTravelCost: (dist: number, terrain: 'clear' | 'complex') => void;
  onCoordsUpdate: (x: number, z: number) => void;
  onTravelingState: (isTraveling: boolean, target: Waypoint | TreatEncounter | null) => void;
  onNearWaypointUpdate: (wp: Waypoint | null) => void;
  onFacingLeftUpdate: (facingLeft: boolean) => void;
  onMovingStateUpdate: (moving: boolean) => void;
  onWaypointTriggerError: (msg: string) => void;
}

export const TREAT_LOCATIONS: TreatEncounter[] = [
  { id: 'treat_alley_1', name: 'tuna', x: 25.0, z: 30.0, energyValue: 20, effectLabel: '+20 Energy' },
  { id: 'treat_alley_2', name: 'kibble', x: 70.0, z: 20.0, energyValue: 15, effectLabel: '+15 Energy' },
  { id: 'treat_alley_3', name: 'tuna', x: 45.0, z: 65.0, energyValue: 35, effectLabel: '+35 Energy' },
  { id: 'treat_alley_4', name: 'kibble', x: 15.0, z: 85.0, energyValue: 25, effectLabel: '+25 Energy' },
  { id: 'treat_alley_5', name: 'tuna', x: 85.0, z: 70.0, energyValue: 30, effectLabel: '+30 Energy' },
];

export class MapEngine {
  private canvas: HTMLCanvasElement;
  private container: HTMLDivElement;
  private status: CatStatus;
  private callbacks: MapEngineCallbacks;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private clock = new THREE.Clock();
  private isDestroyed = false;

  private groundMesh!: THREE.Mesh;
  private cameraTarget = new THREE.Vector3(50, 0, 50);
  private zoomLevel = 50;

  // OOP Entities
  public player!: PlayerEntity;
  private waypointEntities: WaypointEntity[] = [];
  private treatEntities: TreatEntity[] = [];
  private entities: BaseEntity[] = [];

  // Input & State
  private input: InputManager;
  private isTraveling = false;
  private travelTarget: Waypoint | TreatEncounter | null = null;
  private travelStart: { x: number; z: number } | null = null;
  private manualTravelDebt = 0;
  private collectedTreats: string[] = [];
  private nearWaypoint: Waypoint | null = null;
  private footstepDist = 0;
  private isMovingPrev = false;

  constructor(
    canvas: HTMLCanvasElement,
    container: HTMLDivElement,
    status: CatStatus,
    initialCoords: { x: number; z: number },
    callbacks: MapEngineCallbacks
  ) {
    this.canvas = canvas;
    this.container = container;
    this.status = status;
    this.callbacks = callbacks;
    this.collectedTreats = status.collectedTreats ?? [];

    this.input = new InputManager(this.handleActionInput);

    this.initThree(initialCoords);
    this.input.init();
    
    // Start animation loop
    requestAnimationFrame(this.tick);
  }

  private initThree(coords: { x: number; z: number }): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.up.set(0, 0, -1);
    this.cameraTarget.set(coords.x, 0, coords.z);
    this.camera.position.set(coords.x, this.zoomLevel, coords.z);
    this.camera.lookAt(this.cameraTarget);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight('#FFFDF5', 1.3);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#FFF3E0', 0.9);
    dirLight.position.set(50, 80, 50);
    this.scene.add(dirLight);

    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const proceduralCanvas = drawProceduralMapCanvas();
    const proceduralTexture = new THREE.CanvasTexture(proceduralCanvas);
    proceduralTexture.colorSpace = THREE.SRGBColorSpace;

    const groundMaterial = new THREE.MeshBasicMaterial({ map: proceduralTexture });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMaterial);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.set(50, 0, 50);
    this.scene.add(this.groundMesh);

    // Load full Map Textures
    const textureLoader = new THREE.TextureLoader();
    const loadBackupBasemap = () => {
      textureLoader.load('/map/basemap.png', (texture) => {
        if (texture.image && (texture.image.width > 1 || texture.image.naturalWidth > 1)) {
          texture.colorSpace = THREE.SRGBColorSpace;
          groundMaterial.map = texture;
          groundMaterial.needsUpdate = true;
        } else {
          textureLoader.load('/map/basemap.jpg', (texJpg) => {
            if (texJpg.image && (texJpg.image.width > 1 || texJpg.image.naturalWidth > 1)) {
              texJpg.colorSpace = THREE.SRGBColorSpace;
              groundMaterial.map = texJpg;
              groundMaterial.needsUpdate = true;
            }
          });
        }
      });
    };

    textureLoader.load(
      '/map/wholemap.png',
      (texture) => {
        if (texture.image && (texture.image.width > 1 || texture.image.naturalWidth > 1)) {
          texture.colorSpace = THREE.SRGBColorSpace;
          groundMaterial.map = texture;
          groundMaterial.needsUpdate = true;
        } else {
          loadBackupBasemap();
        }
      },
      undefined,
      loadBackupBasemap
    );

    // Spawn Waypoints
    WAYPOINTS.forEach((wp) => {
      const wpEnt = new WaypointEntity(wp, textureLoader);
      this.scene.add(wpEnt.group);
      this.waypointEntities.push(wpEnt);
      this.entities.push(wpEnt);
    });

    // Spawn Treats
    TREAT_LOCATIONS.forEach((treat) => {
      if (this.collectedTreats.includes(treat.id)) return;
      const treatEnt = new TreatEntity(treat);
      this.scene.add(treatEnt.group);
      this.treatEntities.push(treatEnt);
      this.entities.push(treatEnt);
    });

    // Spawn Player
    const catCanvas = createCatTextureCanvas(this.status.avatarId, this.status.name);
    const catTexture = new THREE.CanvasTexture(catCanvas);
    catTexture.colorSpace = THREE.SRGBColorSpace;

    this.player = new PlayerEntity(coords.x, coords.z, catTexture);
    this.scene.add(this.player.group);
  }

  public updateStatus(status: CatStatus): void {
    this.status = status;
    this.collectedTreats = status.collectedTreats ?? [];
  }

  public setZoom(level: number): void {
    this.zoomLevel = level;
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public startTravel(target: Waypoint | TreatEncounter): void {
    if (this.isTraveling) return;

    if ('type' in target && target.id === 'house') {
      const allPawsDiscovered = ['rival', 'comrades', 'food', 'pet'].every(id =>
        this.status.visitedPoints.includes(id)
      );

      if (!allPawsDiscovered) {
        this.callbacks.onWaypointTriggerError(
          "Ms. Eleanor's cottage steps are locked. Please discover all 4 target paw prints (Objectives) before visiting her porch."
        );
        audio.playHiss();
        return;
      }
    }

    audio.playPurr();
    this.travelStart = { x: this.player.x, z: this.player.z };
    this.travelTarget = target;
    this.isTraveling = true;
    this.callbacks.onTravelingState(true, target);
  }

  private handleActionInput = (): void => {
    if (this.nearWaypoint && !this.isTraveling) {
      this.startTravel(this.nearWaypoint);
    }
  };

  private collectTreat(treatEnt: TreatEntity): void {
    const treat = treatEnt.treatData;
    if (this.collectedTreats.includes(treat.id)) return;

    audio.playPurr();
    const dynamicCollected = [...this.collectedTreats, treat.id];
    this.collectedTreats = dynamicCollected;

    // Remove 3D representation
    treatEnt.destroy(this.scene);
    
    // Remove from managed entities
    this.treatEntities = this.treatEntities.filter((t) => t.treatData.id !== treat.id);
    this.entities = this.entities.filter((e) => e !== treatEnt);

    this.callbacks.onCollectTreat({
      id: treat.id,
      name: treat.name,
      effectLabel: treat.effectLabel,
      energy: treat.energyValue
    });
  }

  private project3DTo2D(x: number, z: number): { x: number; y: number } {
    const vec = new THREE.Vector3(x, 0, z);
    vec.project(this.camera);
    const xPercent = (vec.x * 0.5 + 0.5) * 100;
    const yPercent = (-vec.y * 0.5 + 0.5) * 100;
    return { x: xPercent, y: yPercent };
  }

  private tick = (): void => {
    if (this.isDestroyed) return;
    requestAnimationFrame(this.tick);

    const time = this.clock.getElapsedTime();

    // Check if moving
    let isMovingNow = false;
    let moveDir = 0;
    const activeSpeed = this.status.energy < 30 ? 0.225 : 0.45;

    if (this.isTraveling && this.travelTarget) {
      const target = this.travelTarget;
      const targetX = target.x;
      const targetZ = 'y' in target ? target.y : target.z;
      const dx = targetX - this.player.x;
      const dz = targetZ - this.player.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 0.6) {
        isMovingNow = true;
        const stepX = (dx / dist) * activeSpeed;
        const stepZ = (dz / dist) * activeSpeed;
        this.player.x += stepX;
        this.player.z += stepZ;
        moveDir = stepX < 0 ? -1 : 1;
      } else {
        this.player.x = targetX;
        this.player.z = targetZ;
        this.isTraveling = false;
        this.travelTarget = null;
        this.callbacks.onTravelingState(false, null);

        if (this.travelStart) {
          const tripX = targetX - this.travelStart.x;
          const tripZ = targetZ - this.travelStart.z;
          const isWaypoint = 'type' in target;
          const terrain = isWaypoint && (target.type === 'rival' || target.type === 'pond') ? 'complex' : 'clear';
          this.callbacks.onTravelCost(Math.sqrt(tripX * tripX + tripZ * tripZ), terrain);
          this.travelStart = null;
        }

        if ('type' in target) {
          this.callbacks.onVisitWaypoint(target);
        }
      }
    } else {
      let moveX = 0;
      let moveZ = 0;

      if (this.input.keys['up']) moveZ -= 1;
      if (this.input.keys['down']) moveZ += 1;
      if (this.input.keys['left']) moveX -= 1;
      if (this.input.keys['right']) moveX += 1;

      if (moveX !== 0 && moveZ !== 0) {
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        moveX /= length;
        moveZ /= length;
      }

      if (moveX !== 0 || moveZ !== 0) {
        isMovingNow = true;
        const stepX = moveX * activeSpeed;
        const stepZ = moveZ * activeSpeed;
        this.player.x += stepX;
        this.player.z += stepZ;
        moveDir = stepX < 0 ? -1 : 1;

        this.player.x = Math.max(4, Math.min(96, this.player.x));
        this.player.z = Math.max(4, Math.min(96, this.player.z));

        this.manualTravelDebt += Math.sqrt(stepX * stepX + stepZ * stepZ);
        if (this.manualTravelDebt >= 18) {
          this.callbacks.onTravelCost(this.manualTravelDebt, 'clear');
          this.manualTravelDebt = 0;
        }
      }
    }

    // Update player
    this.player.isMoving = isMovingNow;
    if (isMovingNow !== this.isMovingPrev) {
      this.isMovingPrev = isMovingNow;
      this.callbacks.onMovingStateUpdate(isMovingNow);
    }
    if (moveDir !== 0) {
      this.player.facingLeft = moveDir < 0;
      this.callbacks.onFacingLeftUpdate(moveDir < 0);
    }
    this.player.update(time);
    this.player.updateTrail(this.scene);

    // Play footstep audio
    if (isMovingNow) {
      this.footstepDist += activeSpeed;
      if (this.footstepDist >= 6) {
        this.footstepDist = 0;
        audio.playWaterLap();
      }
    }

    // Update managed entities
    this.entities.forEach((ent) => ent.update(time));

    // Collision checks for treats
    this.treatEntities.forEach((treatEnt) => {
      const treat = treatEnt.treatData;
      if (!this.collectedTreats.includes(treat.id)) {
        const tDx = this.player.x - treat.x;
        const tDz = this.player.z - treat.z;
        if (Math.sqrt(tDx * tDx + tDz * tDz) < 2.5) {
          this.collectTreat(treatEnt);
        }
      }
    });

    // Waypoint proximity checks
    let closestWp: Waypoint | null = null;
    let minDistance = Infinity;

    this.waypointEntities.forEach((wpEnt) => {
      const wp = wpEnt.waypointData;
      const dx = this.player.x - wp.x;
      const dz = this.player.z - wp.y;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDistance) {
        minDistance = dist;
        closestWp = wp;
      }
    });

    if (minDistance < 6) {
      if (this.nearWaypoint?.id !== closestWp?.id) {
        this.nearWaypoint = closestWp;
        this.callbacks.onNearWaypointUpdate(closestWp);
      }
    } else {
      if (this.nearWaypoint !== null) {
        this.nearWaypoint = null;
        this.callbacks.onNearWaypointUpdate(null);
      }
    }

    // Sync coordinate outputs to React (throttle)
    if (Math.floor(time * 15) % 3 === 0) {
      this.callbacks.onCoordsUpdate(
        parseFloat(this.player.x.toFixed(1)),
        parseFloat(this.player.z.toFixed(1))
      );
    }

    // Camera follow player
    const camTargetX = THREE.MathUtils.clamp(this.player.x, 30, 70);
    const camTargetZ = THREE.MathUtils.clamp(this.player.z, 30, 70);

    this.cameraTarget.x += (camTargetX - this.cameraTarget.x) * 0.08;
    this.cameraTarget.z += (camTargetZ - this.cameraTarget.z) * 0.08;

    this.camera.position.x = this.cameraTarget.x;
    this.camera.position.y = this.zoomLevel;
    this.camera.position.z = this.cameraTarget.z;
    this.camera.lookAt(this.cameraTarget);

    // Render WebGL
    this.renderer.render(this.scene, this.camera);

    // Sync 2D HTML elements positioning overlays
    this.waypointEntities.forEach((wpEnt) => {
      const el = document.getElementById(`waypoint-${wpEnt.waypointData.id}`);
      if (el) {
        const pos = this.project3DTo2D(wpEnt.x, wpEnt.z);
        el.style.left = `${pos.x}%`;
        el.style.top = `${pos.y}%`;
      }
    });

    this.treatEntities.forEach((treatEnt) => {
      const el = document.getElementById(`treat-node-${treatEnt.treatData.id}`);
      if (el) {
        if (this.collectedTreats.includes(treatEnt.treatData.id)) {
          el.style.display = 'none';
        } else {
          const pos = this.project3DTo2D(treatEnt.x, treatEnt.z);
          el.style.left = `${pos.x}%`;
          el.style.top = `${pos.y}%`;
          el.style.display = 'block';
        }
      }
    });

    const catLabel = document.getElementById('active-cat-avatar-marker');
    if (catLabel) {
      const pos = this.project3DTo2D(this.player.x, this.player.z);
      catLabel.style.left = `${pos.x}%`;
      catLabel.style.top = `${pos.y}%`;
    }
  };

  public destroy(): void {
    this.isDestroyed = true;
    this.input.destroy();
    this.entities.forEach((ent) => ent.destroy(this.scene));
    this.player.destroy(this.scene);
    
    this.groundMesh.geometry.dispose();
    if (this.groundMesh.material instanceof THREE.Material) {
      this.groundMesh.material.dispose();
    }

    this.renderer.dispose();
  }
}
