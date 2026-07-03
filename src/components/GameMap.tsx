import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CatStatus, Waypoint } from '../types';
import { WAYPOINTS } from '../data/storyData';
import { CatIcon } from './CatIcon';
import { motion, AnimatePresence } from 'motion/react';
import { audio } from '../utils/audio';
import {
  Heart,
  Flame,
  Zap,
  CheckCircle2,
  Navigation,
  Volume2,
  VolumeX,
  AlertTriangle,
  Home,
  ArrowRight,
  Info,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import {
  drawProceduralMapCanvas,
  createCatTextureCanvas,
  createWaypointTextureCanvas
} from '../utils/mapHelpers';

interface GameMapProps {
  status: CatStatus;
  initialCoords?: { x: number; z: number };
  onVisitWaypoint: (waypoint: Waypoint) => void;
  onUnlockEnding: () => void;
}

export const GameMap: React.FC<GameMapProps> = ({
  status,
  initialCoords,
  onVisitWaypoint,
  onUnlockEnding
}) => {
  // Sync state coordinates for HUD display
  const [currentX, setCurrentX] = useState<number>(initialCoords?.x ?? 13.5);
  const [currentY, setCurrentY] = useState<number>(initialCoords?.z ?? 75.7);
  const [isTraveling, setIsTraveling] = useState<boolean>(false);
  const [travelTarget, setTravelTarget] = useState<Waypoint | null>(null);
  const [nearWaypoint, setNearWaypoint] = useState<Waypoint | null>(null);
  
  const [activeWaypointId, setActiveWaypointId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [facingLeft, setFacingLeft] = useState<boolean>(false);
  const [facingBack, setFacingBack] = useState<boolean>(false);

  // Quests overlay & button state
  const [questsOpen, setQuestsOpen] = useState<boolean>(false);
  const [questImgSrc, setQuestImgSrc] = useState<string>('/quest.png');
  const [questImgFailed, setQuestImgFailed] = useState<boolean>(false);
  const questDropdownRef = useRef<HTMLDivElement>(null);

  // Close quests panel on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (questsOpen && questDropdownRef.current && !questDropdownRef.current.contains(event.target as Node)) {
        const btn = document.getElementById('quest-button');
        if (btn && btn.contains(event.target as Node)) {
          return;
        }
        setQuestsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [questsOpen]);

  // Sync state and threejs coordinate positions when initialCoords changes
  useEffect(() => {
    if (initialCoords) {
      setCurrentX(initialCoords.x);
      setCurrentY(initialCoords.z);
      catPosRef.current.x = initialCoords.x;
      catPosRef.current.z = initialCoords.z;
      if (catMeshRef.current) {
        catMeshRef.current.position.set(initialCoords.x, 0, initialCoords.z);
      }
      if (cameraRef.current && cameraTargetRef.current) {
        cameraTargetRef.current.set(initialCoords.x, 0, initialCoords.z);
        cameraRef.current.position.set(initialCoords.x, zoomLevelRef.current, initialCoords.z);
        cameraRef.current.lookAt(cameraTargetRef.current);
      }
    }
  }, [initialCoords]);

  // Zoom control state & ref
  const [zoomLevel, setZoomLevel] = useState<number>(50); // camera.position.y (default 50)
  const zoomLevelRef = useRef(50);

  const [objectivesCollapsed, setObjectivesCollapsed] = useState<boolean>(false);

  const handleZoomIn = () => {
    setZoomLevel((prev) => {
      const next = Math.max(20, prev - 5);
      zoomLevelRef.current = next;
      return next;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.min(85, prev + 5);
      zoomLevelRef.current = next;
      return next;
    });
  };

  // HTML Containers & Canvas Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References for Three.js loop to bypass React closures
  const catPosRef = useRef({
    x: initialCoords?.x ?? 13.5,
    z: initialCoords?.z ?? 75.7
  });
  const isTravelingRef = useRef(false);
  const travelTargetRef = useRef<Waypoint | null>(null);
  const nearWaypointRef = useRef<Waypoint | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});

  // Three.js instances
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const catMeshRef = useRef<THREE.Group | null>(null);
  const cameraTargetRef = useRef(new THREE.Vector3(50, 0, 50));

  // Initialize and update keyboard arrow listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd', ' ', 'Enter'];
      if (keys.includes(e.key)) {
        e.preventDefault(); // Stop page scrolling
      }
      
      const keyMap: Record<string, string> = {
        ArrowUp: 'up', w: 'up', W: 'up',
        ArrowDown: 'down', s: 'down', S: 'down',
        ArrowLeft: 'left', a: 'left', A: 'left',
        ArrowRight: 'right', d: 'right', D: 'right'
      };

      const mapped = keyMap[e.key];
      if (mapped) {
        keysRef.current[mapped] = true;
      }

      // Space or Enter to interact if close to a waypoint
      if ((e.key === ' ' || e.key === 'Enter') && nearWaypointRef.current && !isTravelingRef.current) {
        handleWaypointClick(nearWaypointRef.current);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyMap: Record<string, string> = {
        ArrowUp: 'up', w: 'up', W: 'up',
        ArrowDown: 'down', s: 'down', S: 'down',
        ArrowLeft: 'left', a: 'left', A: 'left',
        ArrowRight: 'right', d: 'right', D: 'right'
      };

      const mapped = keyMap[e.key];
      if (mapped) {
        keysRef.current[mapped] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status.visitedPoints]);

  // Handle waypoint navigation and triggers
  const handleWaypointClick = (waypoint: Waypoint) => {
    if (isTravelingRef.current) return;

    if (waypoint.id === 'house') {
      const allPawsDiscovered = ['rival', 'comrades', 'food', 'pet'].every(id => 
        status.visitedPoints.includes(id)
      );

      if (!allPawsDiscovered) {
        setErrorMessage("Ms. Eleanor's cottage steps are locked. Please discover all 4 target paw prints (Objectives) before visiting her porch.");
        setTimeout(() => setErrorMessage(null), 5000);
        audio.playHiss();
        return;
      }
    }

    // Start auto-walking toward the waypoint
    audio.playPurr();
    travelTargetRef.current = waypoint;
    setTravelTarget(waypoint);
    isTravelingRef.current = true;
    setIsTraveling(true);
  };

  // Toggle audio
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (nextMute) {
      audio.setMute(true);
    } else {
      audio.setMute(false);
    }
  };

  // Initialize Three.js Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.up.set(0, 0, -1); // Keep top-down 2D orientation (no flip or rotation)
    cameraTargetRef.current.set(catPosRef.current.x, 0, catPosRef.current.z);
    camera.position.set(catPosRef.current.x, zoomLevelRef.current, catPosRef.current.z);
    camera.lookAt(cameraTargetRef.current);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight('#FFFDF5', 1.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#FFF3E0', 0.9);
    dirLight.position.set(50, 80, 50);
    scene.add(dirLight);

    // 5. Board Ground Plane
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const proceduralCanvas = drawProceduralMapCanvas();
    const proceduralTexture = new THREE.CanvasTexture(proceduralCanvas);
    proceduralTexture.colorSpace = THREE.SRGBColorSpace;

    const groundMaterial = new THREE.MeshBasicMaterial({ map: proceduralTexture });
    const groundMesh = new THREE.Mesh(groundGeo, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2; // Flat on horizontal plane
    groundMesh.position.set(50, 0, 50); // Move center of 100x100 to positive quad
    scene.add(groundMesh);

    // Try loading custom base map from /public/map directory with validation
    const textureLoader = new THREE.TextureLoader();

    const loadBackupBasemap = () => {
      textureLoader.load(
        '/map/basemap.png',
        (texture) => {
          if (texture.image && (texture.image.width > 1 || texture.image.naturalWidth > 1)) {
            texture.colorSpace = THREE.SRGBColorSpace;
            groundMaterial.map = texture;
            groundMaterial.needsUpdate = true;
          } else {
            textureLoader.load(
              '/map/basemap.jpg',
              (texJpg) => {
                if (texJpg.image && (texJpg.image.width > 1 || texJpg.image.naturalWidth > 1)) {
                  texJpg.colorSpace = THREE.SRGBColorSpace;
                  groundMaterial.map = texJpg;
                  groundMaterial.needsUpdate = true;
                } else {
                  console.log('No custom map uploaded or found. Using illustrated procedural tabletop board map.');
                }
              }
            );
          }
        },
        undefined,
        () => {
          textureLoader.load(
            '/map/basemap.jpg',
            (texJpg) => {
              if (texJpg.image && (texJpg.image.width > 1 || texJpg.image.naturalWidth > 1)) {
                texJpg.colorSpace = THREE.SRGBColorSpace;
                groundMaterial.map = texJpg;
                groundMaterial.needsUpdate = true;
              }
            }
          );
        }
      );
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
      () => {
        loadBackupBasemap();
      }
    );

    // 6. Waypoints 3D representation
    const waypointMeshes: THREE.Group[] = [];
    const waypointRefsMap: Record<string, THREE.Group> = {};

    WAYPOINTS.forEach((wp) => {
      const group = new THREE.Group();
      group.position.set(wp.x, 0.1, wp.y);

      // Rotating Ring flat on ground
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
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      group.add(ringMesh);

      // Cardboard Circle token on top
      const letter = wp.id === 'house' ? 'H' :
                     wp.id === 'rival' ? 'A' :
                     wp.id === 'pond' ? 'O' :
                     wp.id === 'comrades' ? 'B' :
                     wp.id === 'food' ? 'C' : 'D';

      const tokenCanvas = createWaypointTextureCanvas(letter, colorHex);
      const tokenTexture = new THREE.CanvasTexture(tokenCanvas);
      tokenTexture.colorSpace = THREE.SRGBColorSpace;

      const cardGeo = new THREE.PlaneGeometry(4.5, 4.5);
      const cardMat = new THREE.MeshBasicMaterial({
        map: tokenTexture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const cardMesh = new THREE.Mesh(cardGeo, cardMat);
      cardMesh.position.y = 3.5; // Raised slightly
      group.add(cardMesh);

      // Attempt to load custom paw texture if uploaded
      if (wp.id !== 'house') {
        textureLoader.load(
          '/map/paw.png',
          (pawTex) => {
            if (pawTex.image && (pawTex.image.width > 1 || pawTex.image.naturalWidth > 1)) {
              pawTex.colorSpace = THREE.SRGBColorSpace;
              cardMat.map = pawTex;
              cardMat.needsUpdate = true;
            } else {
              // Try loading backup paws.png
              textureLoader.load(
                '/map/paws.png',
                (pawsTex) => {
                  if (pawsTex.image && (pawsTex.image.width > 1 || pawsTex.image.naturalWidth > 1)) {
                    pawsTex.colorSpace = THREE.SRGBColorSpace;
                    cardMat.map = pawsTex;
                    cardMat.needsUpdate = true;
                  }
                }
              );
            }
          },
          undefined,
          () => {
            textureLoader.load(
              '/map/paws.png',
              (pawsTex) => {
                if (pawsTex.image && (pawsTex.image.width > 1 || pawsTex.image.naturalWidth > 1)) {
                  pawsTex.colorSpace = THREE.SRGBColorSpace;
                  cardMat.map = pawsTex;
                  cardMat.needsUpdate = true;
                }
              },
              undefined,
              () => {}
            );
          }
        );
      }

      scene.add(group);
      waypointMeshes.push(group);
      waypointRefsMap[wp.id] = group;
    });

    // 7. Player 3D Standee Base Group (crisp animated vector SVG is layered over this in HTML!)
    const catGroup = new THREE.Group();
    catGroup.position.set(catPosRef.current.x, 0, catPosRef.current.z);

    // Small circular dark wood base cylinder
    const baseGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.4, 16);
    const baseMat = new THREE.MeshStandardMaterial({
      color: '#4a3728',
      roughness: 0.8
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.2;
    catGroup.add(baseMesh);

    // Flat black shadow ring at the base of the cylinder
    const shadowGeo = new THREE.RingGeometry(0, 2.6, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: '#1a1813',
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    catGroup.add(shadowMesh);

    scene.add(catGroup);
    catMeshRef.current = catGroup;

    // 8. Tabletop Environment Assets & Billboards
    const billboards: THREE.Object3D[] = [];

    // Helper to load image or backup, with beautiful low-poly fallback models
    const loadBillboardOrFallback = (
      imageUrl: string,
      backupUrl: string,
      fallbackCreator: () => THREE.Group,
      x: number,
      z: number,
      w: number,
      h: number
    ) => {
      const spawnFallback = () => {
        const fallbackGroup = fallbackCreator();
        fallbackGroup.position.set(x, 0, z);
        scene.add(fallbackGroup);
      };

      const loadBackup = () => {
        textureLoader.load(
          backupUrl,
          (texture) => {
            if (texture.image && (texture.image.width > 1 || texture.image.naturalWidth > 1)) {
              texture.colorSpace = THREE.SRGBColorSpace;
              texture.minFilter = THREE.LinearFilter;
              texture.magFilter = THREE.LinearFilter;
              const mat = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
              });
              const geo = new THREE.PlaneGeometry(w, h);
              const mesh = new THREE.Mesh(geo, mat);
              mesh.position.set(x, h / 2, z);
              scene.add(mesh);
              billboards.push(mesh);
            } else {
              spawnFallback();
            }
          },
          undefined,
          () => {
            spawnFallback();
          }
        );
      };

      textureLoader.load(
        imageUrl,
        (texture) => {
          if (texture.image && (texture.image.width > 1 || texture.image.naturalWidth > 1)) {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            const mat = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
              side: THREE.DoubleSide
            });
            const geo = new THREE.PlaneGeometry(w, h);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, h / 2, z);
            scene.add(mesh);
            billboards.push(mesh);
          } else {
            loadBackup();
          }
        },
        undefined,
        () => {
          loadBackup();
        }
      );
    };

    // Direct flat 2D decal loader for newly uploaded assets (non-3D, aligned parallel to ground map)
    const loadDirectBillboard = (
      imageUrl: string,
      x: number,
      z: number,
      w: number,
      h: number,
      fallbackCreator?: () => THREE.Group
    ) => {
      textureLoader.load(
        imageUrl,
        (texture) => {
          if (texture.image && (texture.image.width > 1 || texture.image.naturalWidth > 1)) {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            const mat = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
              side: THREE.DoubleSide,
              depthWrite: false // prevents blocky outlines or overlapping clip boxes
            });
            const geo = new THREE.PlaneGeometry(w, h);
            const mesh = new THREE.Mesh(geo, mat);
            // Lay flat parallel to the ground board, slightly elevated to prevent z-fighting
            mesh.position.set(x, 0.08, z);
            mesh.rotation.x = -Math.PI / 2;
            scene.add(mesh);
          } else if (fallbackCreator) {
            const fallbackGroup = fallbackCreator();
            fallbackGroup.position.set(x, 0, z);
            scene.add(fallbackGroup);
          }
        },
        undefined,
        () => {
          if (fallbackCreator) {
            const fallbackGroup = fallbackCreator();
            fallbackGroup.position.set(x, 0, z);
            scene.add(fallbackGroup);
          }
        }
      );
    };

    // Low-poly cottage piece
    const createHouseFallback = () => {
      const group = new THREE.Group();
      const bGeo = new THREE.BoxGeometry(6, 4, 5);
      const bMat = new THREE.MeshStandardMaterial({ color: '#EBE7DD', roughness: 0.7 });
      const baseObj = new THREE.Mesh(bGeo, bMat);
      baseObj.position.y = 2;
      group.add(baseObj);

      const rGeo = new THREE.ConeGeometry(4.2, 2.8, 4);
      const rMat = new THREE.MeshStandardMaterial({ color: '#8B0000', roughness: 0.8 });
      const roofObj = new THREE.Mesh(rGeo, rMat);
      roofObj.position.y = 5.4;
      roofObj.rotation.y = Math.PI / 4;
      group.add(roofObj);

      const dGeo = new THREE.BoxGeometry(1.2, 2.2, 0.1);
      const dMat = new THREE.MeshStandardMaterial({ color: '#4A3B32' });
      const doorObj = new THREE.Mesh(dGeo, dMat);
      doorObj.position.set(0, 1.1, 2.51);
      group.add(doorObj);

      const cGeo = new THREE.BoxGeometry(0.8, 2.2, 0.8);
      const cMat = new THREE.MeshStandardMaterial({ color: '#696969' });
      const chimneyObj = new THREE.Mesh(cGeo, cMat);
      chimneyObj.position.set(1.8, 4.2, 1.0);
      group.add(chimneyObj);
      return group;
    };

    // Low-poly tree piece
    const createTreeFallback = () => {
      const group = new THREE.Group();
      const tGeo = new THREE.CylinderGeometry(0.3, 0.5, 2.2, 8);
      const tMat = new THREE.MeshStandardMaterial({ color: '#5C4033', roughness: 0.9 });
      const trunkObj = new THREE.Mesh(tGeo, tMat);
      trunkObj.position.y = 1.1;
      group.add(trunkObj);

      const fGeo1 = new THREE.ConeGeometry(1.8, 3.5, 8);
      const fMat = new THREE.MeshStandardMaterial({ color: '#2E5A27', roughness: 0.8 });
      const foliageObj1 = new THREE.Mesh(fGeo1, fMat);
      foliageObj1.position.y = 3.5;
      group.add(foliageObj1);

      const fGeo2 = new THREE.ConeGeometry(1.3, 2.5, 8);
      const foliageObj2 = new THREE.Mesh(fGeo2, fMat);
      foliageObj2.position.y = 4.8;
      group.add(foliageObj2);
      return group;
    };

    // Low-poly car piece
    const createCarFallback = () => {
      const group = new THREE.Group();
      const cGeo = new THREE.BoxGeometry(4, 1.2, 2);
      const cMat = new THREE.MeshStandardMaterial({ color: '#B22222', roughness: 0.5 });
      const carBase = new THREE.Mesh(cGeo, cMat);
      carBase.position.y = 0.8;
      group.add(carBase);

      const cabGeo = new THREE.BoxGeometry(2.2, 1, 1.7);
      const cabMat = new THREE.MeshStandardMaterial({ color: '#FDFCF5', roughness: 0.4 });
      const cabObj = new THREE.Mesh(cabGeo, cabMat);
      cabObj.position.set(-0.2, 1.8, 0);
      group.add(cabObj);

      const wGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 12);
      const wMat = new THREE.MeshStandardMaterial({ color: '#1A1A1A', roughness: 0.9 });
      wGeo.rotateX(Math.PI / 2);

      const wheelCoords = [
        { x: -1.2, z: 1.0 }, { x: 1.2, z: 1.0 },
        { x: -1.2, z: -1.0 }, { x: 1.2, z: -1.0 }
      ];
      wheelCoords.forEach(pos => {
        const wheel = new THREE.Mesh(wGeo, wMat);
        wheel.position.set(pos.x, 0.4, pos.z);
        group.add(wheel);
      });
      return group;
    };

    // Low-poly bench piece
    const createBenchFallback = () => {
      const group = new THREE.Group();
      const sGeo = new THREE.BoxGeometry(3, 0.15, 1.2);
      const sMat = new THREE.MeshStandardMaterial({ color: '#8B5A2B', roughness: 0.9 });
      const seatObj = new THREE.Mesh(sGeo, sMat);
      seatObj.position.y = 0.8;
      group.add(seatObj);

      const bGeo = new THREE.BoxGeometry(3, 0.8, 0.15);
      const backObj = new THREE.Mesh(bGeo, sMat);
      backObj.position.set(0, 1.3, -0.5);
      group.add(backObj);

      const lGeo = new THREE.BoxGeometry(0.15, 0.8, 1.2);
      const lMat = new THREE.MeshStandardMaterial({ color: '#2F4F4F', roughness: 0.7 });
      const legL = new THREE.Mesh(lGeo, lMat);
      legL.position.set(-1.4, 0.4, 0);
      const legR = new THREE.Mesh(lGeo, lMat);
      legR.position.set(1.4, 0.4, 0);
      group.add(legL);
      group.add(legR);
      return group;
    };

    // Removed other decorative billboards per request to keep only wholemap, the kitty avatar, and points

    // Projection calculation helper inside the loop context
    const project3DTo2D = (x: number, z: number) => {
      const vec = new THREE.Vector3(x, 0, z);
      vec.project(camera);
      const xPercent = (vec.x * 0.5 + 0.5) * 100;
      const yPercent = (-vec.y * 0.5 + 0.5) * 100;
      return { x: xPercent, y: yPercent };
    };

    // Paw Print Texture Generator
    const createPawTexture = () => {
      const pawCanvas = document.createElement('canvas');
      pawCanvas.width = 64;
      pawCanvas.height = 64;
      const pawCtx = pawCanvas.getContext('2d')!;
      
      pawCtx.fillStyle = '#2b1c11'; // Muddy charcoal dark footprint color
      
      // Main Pad
      pawCtx.beginPath();
      pawCtx.ellipse(32, 40, 14, 10, 0, 0, Math.PI * 2);
      pawCtx.fill();
      
      // 4 Toes
      pawCtx.beginPath();
      pawCtx.arc(16, 26, 4.5, 0, Math.PI * 2); // Left-most
      pawCtx.arc(26, 17, 5, 0, Math.PI * 2);   // Mid-left
      pawCtx.arc(38, 17, 5, 0, Math.PI * 2);   // Mid-right
      pawCtx.arc(48, 26, 4.5, 0, Math.PI * 2); // Right-most
      pawCtx.fill();

      const tex = new THREE.CanvasTexture(pawCanvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const defaultPawTex = createPawTexture();
    let currentPawTex: THREE.Texture = defaultPawTex;

    // Load uploaded paw textures if available with validation
    textureLoader.load(
      '/map/paw.png',
      (tex) => {
        if (tex.image && (tex.image.width > 1 || tex.image.naturalWidth > 1)) {
          tex.colorSpace = THREE.SRGBColorSpace;
          currentPawTex = tex;
        } else {
          textureLoader.load(
            '/map/paws.png',
            (backupTex) => {
              if (backupTex.image && (backupTex.image.width > 1 || backupTex.image.naturalWidth > 1)) {
                backupTex.colorSpace = THREE.SRGBColorSpace;
                currentPawTex = backupTex;
              }
            }
          );
        }
      },
      undefined,
      () => {
        textureLoader.load(
          '/map/paws.png',
          (tex) => {
            if (tex.image && (tex.image.width > 1 || tex.image.naturalWidth > 1)) {
              tex.colorSpace = THREE.SRGBColorSpace;
              currentPawTex = tex;
            }
          }
        );
      }
    );

    // Footprints trail array
    const footprints: { mesh: THREE.Mesh; age: number; maxLife: number }[] = [];
    const footprintGeo = new THREE.PlaneGeometry(1.6, 1.6); // Cute tiny paw prints
    let distanceTraveled = 0;
    let lastCatX = catPosRef.current.x;
    let lastCatZ = catPosRef.current.z;
    let alternatePaw = false; // Alternate left and right steps

    // 9. Animation & Loop state variables
    let animationFrameId: number;
    let bobTime = 0;
    let footstepDist = 0;
    const speed = 0.45; // Units per frame

    let lastIsMoving = false;
    let lastFacingLeft = false;
    let lastFacingBack = false;

    const tick = () => {
      let isMovingNow = false;
      let moveDir = 0; // 0 for unchanged, -1 left, 1 right

      // A. Movement Logic
      if (isTravelingRef.current && travelTargetRef.current) {
        const target = travelTargetRef.current;
        const dx = target.x - catPosRef.current.x;
        const dz = target.y - catPosRef.current.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 0.6) {
          isMovingNow = true;
          const stepX = (dx / dist) * speed;
          const stepZ = (dz / dist) * speed;
          catPosRef.current.x += stepX;
          catPosRef.current.z += stepZ;
          moveDir = stepX < 0 ? -1 : 1;
        } else {
          catPosRef.current.x = target.x;
          catPosRef.current.z = target.y;
          isTravelingRef.current = false;
          setIsTraveling(false);
          onVisitWaypoint(target);
        }
      } else {
        let moveX = 0;
        let moveZ = 0;

        if (keysRef.current['up']) moveZ -= 1;
        if (keysRef.current['down']) moveZ += 1;
        if (keysRef.current['left']) moveX -= 1;
        if (keysRef.current['right']) moveX += 1;

        if (moveX !== 0 && moveZ !== 0) {
          const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
          moveX /= length;
          moveZ /= length;
        }

        if (moveX !== 0 || moveZ !== 0) {
          isMovingNow = true;
          const stepX = moveX * speed;
          const stepZ = moveZ * speed;
          catPosRef.current.x += stepX;
          catPosRef.current.z += stepZ;
          moveDir = stepX < 0 ? -1 : 1;

          catPosRef.current.x = Math.max(4, Math.min(96, catPosRef.current.x));
          catPosRef.current.z = Math.max(4, Math.min(96, catPosRef.current.z));
        }
      }

      // Sync coordinate positions
      catGroup.position.set(catPosRef.current.x, 0, catPosRef.current.z);

      // B. Walk Sound Effects & Footprint trail generator
      if (isMovingNow) {
        bobTime += 0.25;
        footstepDist += speed;
        if (footstepDist >= 6) {
          footstepDist = 0;
          audio.playWaterLap();
        }

        // Footprint Generation Logic
        const dx = catPosRef.current.x - lastCatX;
        const dz = catPosRef.current.z - lastCatZ;
        const distStep = Math.sqrt(dx * dx + dz * dz);

        if (distStep > 0.01) {
          distanceTraveled += distStep;

          if (distanceTraveled >= 2.4) {
            distanceTraveled = 0;

            const angle = Math.atan2(dz, dx);
            const perpX = -Math.sin(angle);
            const perpZ = Math.cos(angle);

            // Alternate side offsets to simulate double-step paw path
            const sideOffset = alternatePaw ? 0.45 : -0.45;
            alternatePaw = !alternatePaw;

            const fpX = catPosRef.current.x + (perpX * sideOffset) - (dx / distStep) * 0.6;
            const fpZ = catPosRef.current.z + (perpZ * sideOffset) - (dz / distStep) * 0.6;

            const fpMat = new THREE.MeshBasicMaterial({
              map: currentPawTex,
              transparent: true,
              opacity: 0.6,
              depthWrite: false,
              side: THREE.DoubleSide
            });

            const fpMesh = new THREE.Mesh(footprintGeo, fpMat);
            fpMesh.position.set(fpX, 0.03, fpZ); // Raised flatly slightly above groundbasemap
            fpMesh.rotation.x = -Math.PI / 2;
            fpMesh.rotation.z = -angle - Math.PI / 2;

            scene.add(fpMesh);
            footprints.push({
              mesh: fpMesh,
              age: 0,
              maxLife: 160 // Trail fades out after ~2.6 seconds (160 frames)
            });
          }
        }
      }

      // Track historical cat position for footprint increments
      lastCatX = catPosRef.current.x;
      lastCatZ = catPosRef.current.z;

      // Update Footprints Trail Lifetime & Fading
      for (let i = footprints.length - 1; i >= 0; i--) {
        const fp = footprints[i];
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
          footprints.splice(i, 1);
        }
      }

      // Smooth React state transitions to avoid redundant re-renders
      if (isMovingNow !== lastIsMoving) {
        lastIsMoving = isMovingNow;
        setIsMoving(isMovingNow);
      }

      if (moveDir === -1) {
        if (!lastFacingLeft) {
          lastFacingLeft = true;
          setFacingLeft(true);
        }
      } else if (moveDir === 1) {
        if (lastFacingLeft) {
          lastFacingLeft = false;
          setFacingLeft(false);
        }
      }

      // Track movement in Z to determine if we are facing back
      const dzMovement = catPosRef.current.z - lastCatZ;
      if (isMovingNow && Math.abs(dzMovement) > 0.02) {
        const movingBack = dzMovement < -0.02; // Moving up means negative Z (back of the cat)
        if (movingBack !== lastFacingBack) {
          lastFacingBack = movingBack;
          setFacingBack(movingBack);
        }
      }

      // Rotate Waypoint Rings & Float Waypoint Cards
      const time = clock.getElapsedTime();
      waypointMeshes.forEach((mesh) => {
        const ring = mesh.children[0];
        const card = mesh.children[1];
        if (ring) ring.rotation.z = time * 0.5; // Rotate flat on ground
        if (card) {
          card.position.y = 3.3 + Math.sin(time * 2.5 + mesh.position.x) * 0.4;
          card.rotation.y = time * 0.8; // Spin card token
        }
      });

      // Update coordinate displays (throttled to save CPU)
      if (Math.floor(time * 15) % 3 === 0) {
        setCurrentX(parseFloat(catPosRef.current.x.toFixed(1)));
        setCurrentY(parseFloat(catPosRef.current.z.toFixed(1)));
      }

      // Proximity & Nearest Waypoint checking
      let closestWp: Waypoint | null = null;
      let minDistance = Infinity;

      WAYPOINTS.forEach((wp) => {
        const dx = catPosRef.current.x - wp.x;
        const dz = catPosRef.current.z - wp.y;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < minDistance) {
          minDistance = dist;
          closestWp = wp;
        }
      });

      if (minDistance < 6) {
        if (nearWaypointRef.current?.id !== closestWp?.id) {
          nearWaypointRef.current = closestWp;
          setNearWaypoint(closestWp);
        }
      } else {
        if (nearWaypointRef.current !== null) {
          nearWaypointRef.current = null;
          setNearWaypoint(null);
        }
      }

      // Smooth Camera Centered Follow (Clamped lookAt)
      const camTargetX = THREE.MathUtils.clamp(catPosRef.current.x, 30, 70);
      const camTargetZ = THREE.MathUtils.clamp(catPosRef.current.z, 30, 70);

      cameraTargetRef.current.x += (camTargetX - cameraTargetRef.current.x) * 0.08;
      cameraTargetRef.current.z += (camTargetZ - cameraTargetRef.current.z) * 0.08;

      camera.position.x = cameraTargetRef.current.x;
      camera.position.y = zoomLevelRef.current;
      camera.position.z = cameraTargetRef.current.z; // Straight top-down (no 3D tilt offset)
      camera.lookAt(cameraTargetRef.current);

      // Rotate transparent billboards to face camera
      billboards.forEach((b) => {
        b.quaternion.copy(camera.quaternion);
        b.rotation.x = 0; // stand strictly vertical
        b.rotation.z = 0;
      });

      // HTML Space Projection Updates
      WAYPOINTS.forEach((wp) => {
        const el = document.getElementById(`waypoint-${wp.id}`);
        if (el) {
          const pos = project3DTo2D(wp.x, wp.y);
          el.style.left = `${pos.x}%`;
          el.style.top = `${pos.y}%`;
        }
      });

      const catLabel = document.getElementById('active-cat-avatar-marker');
      if (catLabel) {
        const pos = project3DTo2D(catPosRef.current.x, catPosRef.current.z);
        catLabel.style.left = `${pos.x}%`;
        catLabel.style.top = `${pos.y}%`;
      }

      // Render
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    };

    const clock = new THREE.Clock();
    animationFrameId = requestAnimationFrame(tick);

    // 9. Resize handler
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      groundGeo.dispose();
      groundMaterial.dispose();
      proceduralTexture.dispose();
      baseGeo.dispose();
      baseMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      
      footprintGeo.dispose();
      defaultPawTex.dispose();
      footprints.forEach((fp) => {
        scene.remove(fp.mesh);
        if (fp.mesh.material instanceof THREE.Material) {
          fp.mesh.material.dispose();
        }
      });

      waypointMeshes.forEach((mesh) => {
        const ring = mesh.children[0] as THREE.Mesh;
        const card = mesh.children[1] as THREE.Mesh;
        if (ring) {
          ring.geometry.dispose();
          (ring.material as THREE.Material).dispose();
        }
        if (card) {
          card.geometry.dispose();
          (card.material as THREE.Material).dispose();
          if (card.material instanceof THREE.MeshBasicMaterial && card.material.map) {
            card.material.map.dispose();
          }
        }
      });
    };
  }, [status.avatarId, status.name]);

  const allWaypointsVisited = ['rival', 'comrades', 'food', 'pet'].every((id) =>
    status.visitedPoints.includes(id)
  );

  return (
    <div className="saga-screen min-h-screen w-full p-4 md:p-8 flex flex-col gap-6 relative overflow-hidden" id="gamemap-screen">
      <header className="max-w-7xl mx-auto w-full z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <span className="text-[10px] font-sans font-black tracking-[0.25em] text-[#f4c37c] uppercase">Stray Saga &bull; City Map</span>
          <h1 className="brand-title text-4xl md:text-6xl font-black uppercase leading-none">Alley Expedition</h1>
        </div>
        <div className="saga-badge px-3 py-1.5 text-[9px] font-sans uppercase tracking-widest font-black self-start md:self-auto">
          Adopt Don't Shop
        </div>
      </header>
      {/* Top Banner Alert (Locked State) */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-950/90 border-2 border-red-800 text-red-200 p-4 shadow-[4px_4px_0px_#991b1b] flex items-center gap-3 z-40 text-xs font-sans font-black uppercase tracking-wider"
            id="map-error-bar"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 animate-pulse" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main HUD Bar */}
      <div className="wood-frame max-w-7xl mx-auto w-full z-10 p-4 md:p-5 flex flex-col md:flex-row justify-between items-center gap-4" id="map-hud-bar">
        <div className="flex items-center gap-4 shrink-0">
          <div className="parchment-panel w-14 h-14 p-1 flex items-center justify-center">
            <CatIcon avatarId={status.avatarId} type="avatar" size={48} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-[#ffe0ad]">{status.name}</h2>
            <div className="flex items-center gap-1.5 text-[10px] font-sans font-black text-[#f4c37c] uppercase tracking-wider">
              <Navigation className="w-3 h-3" />
              <span>COORDS: X:{currentX} Z:{currentY}</span>
            </div>
          </div>
        </div>

        {/* Stray Advocacy compact row/insert */}
        <div className="hidden md:flex flex-col gap-0.5 px-4 border-l border-r border-[#f4c37c]/25 max-w-md text-center" id="campaign-widget">
          <span className="text-[8px] font-sans font-black text-[#f4c37c] uppercase tracking-[0.2em] block mb-0.5">STRAY ADVOCACY</span>
          <p className="text-[10px] font-serif leading-normal text-[#ffe0ad]/85 italic">
            "Every kitten deserves a permanent hand that stays. Support local shelters & TNR community programs to save tiny souls."
          </p>
        </div>

        {/* Status bars */}
        <div className="flex flex-wrap gap-6 md:gap-8 justify-center md:justify-end w-full md:w-auto shrink-0">
          {/* Energy Bar */}
          <div className="flex flex-col gap-1 w-28 sm:w-32" id="hud-energy-metric">
            <div className="flex justify-between items-center text-[10px] font-sans font-black text-[#ffe0ad] uppercase tracking-wide">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> ENERGY</span>
              <span>{status.energy}%</span>
            </div>
            <div className="h-3 bg-[#160d0a] border border-[#f4c37c]/50 p-0.5 shadow-inner">
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${status.energy}%` }}
              ></div>
            </div>
          </div>

          {/* Warmth Bar */}
          <div className="flex flex-col gap-1 w-28 sm:w-32" id="hud-warmth-metric">
            <div className="flex justify-between items-center text-[10px] font-sans font-black text-[#ffe0ad] uppercase tracking-wide">
              <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-red-500" /> WARMTH</span>
              <span>{status.warmth}%</span>
            </div>
            <div className="h-3 bg-[#160d0a] border border-[#f4c37c]/50 p-0.5 shadow-inner">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{ width: `${status.warmth}%` }}
              ></div>
            </div>
          </div>

          {/* Trust Bar */}
          <div className="flex flex-col gap-1 w-28 sm:w-32" id="hud-trust-metric">
            <div className="flex justify-between items-center text-[10px] font-sans font-black text-[#ffe0ad] uppercase tracking-wide">
              <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-purple-600" /> TRUST</span>
              <span>{status.trust}%</span>
            </div>
            <div className="h-3 bg-[#160d0a] border border-[#f4c37c]/50 p-0.5 shadow-inner">
              <div
                className="h-full bg-purple-700 transition-all duration-500"
                style={{ width: `${status.trust}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout - Full Width Map, No Sidebar */}
      <div className="max-w-7xl mx-auto z-10 flex flex-col gap-6 w-full min-h-[500px]" id="map-workspace-row">
        
        {/* Full Width: Game Map Board */}
        <div
          ref={containerRef}
          className="saga-map-shell w-full flex flex-col justify-between relative overflow-hidden h-[500px] md:h-[620px] select-none"
          id="map-canvas-container"
        >
          {/* Three.js canvas backdrop */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0" />

          {/* 3D-to-2D Screen Space Projector HTML Floating Markers Overlay */}
          <div className="absolute inset-0 pointer-events-none z-10">
            
            {/* Active Floating Cat Marker Overlay */}
            <div
              id="active-cat-avatar-marker"
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-[85%] flex flex-col items-center select-none z-20"
            >
              <div className="relative flex flex-col items-center">
                {/* Floating Cat Icon */}
                <div
                  className={`drop-shadow-[0_8px_6px_rgba(0,0,0,0.25)] transition-transform duration-200 ${
                    isMoving ? 'animate-bounce' : ''
                  } ${facingLeft ? 'scale-x-[-1]' : 'scale-x-[1]'}`}
                  style={{ transformOrigin: 'bottom center' }}
                >
                  <CatIcon
                    avatarId={status.avatarId}
                    type={status.warmth < 30 ? 'shivering' : 'avatar'}
                    size={144}
                    facingBack={true}
                  />
                </div>
                
                {/* Dynamic Label */}
                <div className="bg-editorial-ink text-editorial-bg text-[8px] font-sans font-black tracking-widest uppercase border border-editorial-ink px-1.5 py-0.5 rounded-xs shadow-md whitespace-nowrap mt-1">
                  {status.name}
                </div>
              </div>
            </div>

            {/* Waypoint Clickable HUD Buttons (Rendered exactly above 3D waypoint positions) */}
            {WAYPOINTS.map((wp) => {
              const isVisited = status.visitedPoints.includes(wp.id);
              const isActive = activeWaypointId === wp.id;
              
              return (
                <button
                  key={wp.id}
                  id={`waypoint-${wp.id}`}
                  onClick={() => handleWaypointClick(wp)}
                  onMouseEnter={() => {
                    if (!isTraveling) setActiveWaypointId(wp.id);
                  }}
                  onMouseLeave={() => setActiveWaypointId(null)}
                  className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 flex flex-col items-center"
                >
                  {/* Waypoint marker badge */}
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-full bg-editorial-ink/20 scale-125 blur-xs group-hover:scale-150 transition-all"></div>
                    <div className="w-8 h-8 rounded-full border border-editorial-ink flex items-center justify-center bg-editorial-bg hover:bg-editorial-ochre text-editorial-ink hover:text-editorial-bg font-sans font-black text-xs transition-colors shadow-sm">
                      {isVisited ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-800" />
                      ) : wp.id === 'house' ? (
                        <Home className="w-4 h-4 text-rose-700 animate-pulse" />
                      ) : (
                        wp.id.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>

                  {/* Tiny label on hover */}
                  {isActive && (
                    <div className="absolute top-10 bg-editorial-bg border border-editorial-ink p-2 shadow-md w-32 rounded-xs pointer-events-none text-left z-30">
                      <h4 className="text-[9px] font-sans font-black text-editorial-ochre uppercase tracking-wider">{wp.name}</h4>
                      <p className="text-[8px] leading-tight font-serif text-editorial-ink mt-0.5">{wp.description}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Zoom Adjust Controls at Very Leftmost Top of the Map */}
          <div className="absolute top-4 left-4 z-30 flex flex-col shadow-[2px_2px_0px_#2D2A26] border border-editorial-ink" id="map-zoom-controls">
            <button
              onClick={handleZoomIn}
              className="bg-editorial-bg hover:bg-editorial-ochre text-editorial-ink w-5 h-5 flex items-center justify-center font-sans font-black text-xs transition-colors cursor-pointer select-none active:bg-editorial-ink active:text-editorial-bg"
              title="Zoom In (Enlarge Map)"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              className="bg-editorial-bg hover:bg-editorial-ochre text-editorial-ink w-5 h-5 flex items-center justify-center font-sans font-black text-xs transition-colors cursor-pointer select-none active:bg-editorial-ink active:text-editorial-bg border-t border-editorial-ink"
              title="Zoom Out (Shrink Map)"
            >
              −
            </button>
          </div>

          {/* Sound Mute Toggle directly under zoom controls */}
          <div className="absolute top-[62px] left-4 z-30 flex flex-col shadow-[2px_2px_0px_#2D2A26] border border-editorial-ink" id="map-sound-controls">
            <button
              onClick={handleToggleMute}
              className="bg-editorial-bg hover:bg-editorial-ochre text-editorial-ink w-5 h-5 flex items-center justify-center transition-colors cursor-pointer select-none active:bg-editorial-ink active:text-editorial-bg"
              title={isMuted ? 'Unmute game' : 'Mute game'}
            >
              {isMuted ? <VolumeX className="w-3 h-3 text-editorial-ink" /> : <Volume2 className="w-3 h-3 text-editorial-ink" />}
            </button>
          </div>

          {/* Floating Instructions & Status Badges */}
          <div className="absolute top-4 left-[42px] z-20 bg-editorial-bg/90 backdrop-blur-xs border border-editorial-ink/30 px-3 py-1.5 shadow-xs flex items-center gap-2 max-w-[260px] pointer-events-none">
            <Info className="w-3.5 h-3.5 text-editorial-ochre shrink-0" />
            <p className="text-[9px] leading-tight font-sans text-editorial-ink font-medium">
              Use <strong>ARROW keys</strong> or <strong>W/A/S/D</strong> to guide {status.name}. Or click nodes to walk automatically.
            </p>
          </div>

          {/* Near Waypoint Proximity Banner Prompt */}
          <AnimatePresence>
            {nearWaypoint && !isTraveling && (
              <motion.div
                initial={{ opacity: 0, y: 30, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 30, x: '-50%' }}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 parchment-panel px-5 py-3 z-30 flex items-center gap-3"
              >
                <div className="w-2.5 h-2.5 bg-editorial-ochre animate-ping rounded-full shrink-0"></div>
                <span className="text-[10px] font-sans font-black uppercase tracking-wider text-editorial-ink whitespace-nowrap">
                  Near {nearWaypoint.name}. Press <span className="px-1.5 py-0.5 bg-editorial-ink text-editorial-bg rounded-sm font-mono text-[9px] mx-0.5">SPACE</span> or <span className="px-1.5 py-0.5 bg-editorial-ink text-editorial-bg rounded-sm font-mono text-[9px] mx-0.5">ENTER</span> to explore!
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auto-traveling overlay block */}
          {isTraveling && travelTarget && (
            <div className="absolute top-4 right-[175px] bg-editorial-bg border border-editorial-ink px-3 py-1.5 z-20 shadow-xs flex items-center gap-2 text-[10px] font-sans font-black text-editorial-ochre uppercase tracking-wider animate-pulse">
              <Navigation className="w-3.5 h-3.5 animate-spin text-editorial-ink" />
              <span>GUIDING TO: {travelTarget.name}</span>
            </div>
          )}

          {/* Active Quests Toggle Button (Uses quest.png / quest-1.png) */}
          <button
            id="quest-button"
            onClick={() => setQuestsOpen(!questsOpen)}
            className="saga-button absolute top-4 right-4 z-30 px-1.5 py-1 transition-all flex items-center justify-between gap-1 cursor-pointer select-none w-[130px] h-10"
            title="View Active Quests"
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0 bg-editorial-beige border border-editorial-ink/10 relative overflow-hidden rounded-xs p-0.5">
              <img
                src={questImgSrc}
                alt="Quests"
                className={`w-full h-full object-contain transition-transform duration-200 hover:scale-105 ${questImgFailed ? 'opacity-0 absolute' : 'opacity-100'}`}
                onError={() => {
                  if (questImgSrc === '/quest.png') {
                    setQuestImgSrc('/quest-1.png');
                  } else {
                    setQuestImgFailed(true);
                  }
                }}
              />
              {questImgFailed && (
                <CheckCircle2 className="w-3.5 h-3.5 text-editorial-ochre animate-pulse" />
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[6.5px] font-sans font-black text-editorial-ochre uppercase tracking-wider leading-none mb-0.5">ACTIVE</span>
              <span className="text-[9px] font-sans font-black text-editorial-ink leading-none tracking-wide">QUESTS</span>
            </div>
            <span className="bg-editorial-ink text-editorial-bg text-[8px] font-sans font-black px-1 py-0.5 ml-0.5 rounded-xs shrink-0">
              {status.visitedPoints.length}/4
            </span>
          </button>

          {/* Active Quests Dropdown Modal */}
          <AnimatePresence>
            {questsOpen && (
              <motion.div
                ref={questDropdownRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="parchment-panel absolute top-[68px] right-4 w-72 z-40 p-4 flex flex-col gap-3"
                id="objectives-widget"
              >
                <div className="border-b-2 border-editorial-ink pb-2 flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-editorial-ochre inline-block"></span>
                    <h3 className="text-xs font-sans font-black text-editorial-ochre uppercase tracking-widest">ACTIVE QUESTS</h3>
                  </div>
                  <button
                    onClick={() => setQuestsOpen(false)}
                    className="text-editorial-ink hover:text-editorial-ochre p-1 transition-colors cursor-pointer"
                    title="Close Quests Panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[11px] font-serif text-editorial-ink/80 italic leading-relaxed">
                  Ms. Eleanor's cottage steps are locked. You must explore all four outer landmarks before her porch unlocks.
                </p>

                <ul className="flex flex-col gap-2.5 font-sans text-xs">
                  {WAYPOINTS.filter(wp => wp.id !== 'house' && wp.id !== 'pond').map((wp) => {
                    const isFound = status.visitedPoints.includes(wp.id);
                    return (
                      <li
                        key={wp.id}
                        onClick={() => {
                          if (!isTraveling) {
                            handleWaypointClick(wp);
                            setQuestsOpen(false); // Close dropdown on choosing travel destination
                          }
                        }}
                        className="flex items-center gap-2.5 py-1 px-1.5 border border-transparent hover:border-editorial-ink/15 hover:bg-editorial-beige cursor-pointer transition-all group rounded-sm"
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isFound 
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-800 shadow-xs' 
                            : 'bg-editorial-bg border-editorial-ink/40 group-hover:border-editorial-ochre'
                        }`}>
                          {isFound ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <span className="text-[8px] font-black">{wp.id.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`font-black text-[9px] uppercase tracking-wider block ${
                            isFound ? 'line-through text-editorial-ink/50' : 'text-editorial-ink'
                          }`}>
                            {wp.name}
                          </span>
                        </div>
                        {!isFound && (
                          <span className="text-[8px] font-sans font-black text-editorial-ochre opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                            Go &rarr;
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* Ms. Eleanor's cottage steps indicator */}
                <div className={`p-2.5 border border-dashed flex items-start gap-2.5 mt-0.5 ${
                  allWaypointsVisited 
                    ? 'bg-emerald-50 border-emerald-500/30' 
                    : 'bg-red-50/50 border-red-500/10'
                }`}>
                  <Home className={`w-4 h-4 shrink-0 ${allWaypointsVisited ? 'text-emerald-800' : 'text-red-700 animate-pulse'}`} />
                  <div>
                    <span className="text-[9px] font-sans font-black uppercase tracking-wider block leading-none mb-0.5">Ms. Eleanor's Cottage</span>
                    <p className="text-[9px] leading-tight font-serif text-editorial-ink/75">
                      {allWaypointsVisited 
                        ? "UNLOCKED! Head to the cottage steps (H) for your safe haven."
                        : "LOCKED. Complete all 4 landmarks first."
                      }
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>


        </div>
      </div>
    </div>
  );
};
