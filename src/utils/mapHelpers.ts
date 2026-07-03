// Map and Token Texture Generators for Stray Saga 3D Tabletop Gameboard
// These generate highly detailed HTMLCanvasElements that are loaded directly into Three.js textures.

export function drawProceduralMapCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  
  // Base background (Editorial Paper Beige)
  ctx.fillStyle = '#EBE7DD';
  ctx.fillRect(0, 0, 1024, 1024);
  
  // Grid lines/dots like a beautiful vintage notebook
  ctx.fillStyle = '#C4C0B4';
  for (let x = 32; x < 1024; x += 64) {
    for (let y = 32; y < 1024; y += 64) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Roads / Streets:
  // Main diagonal street representing the cold, loud asphalt street the cat is leaving (bottom-left to middle-right)
  ctx.strokeStyle = '#D5D0C0';
  ctx.lineWidth = 140;
  ctx.beginPath();
  ctx.moveTo(-100, 700);
  ctx.lineTo(800, 1124);
  ctx.stroke();
  
  // Darker asphalt border lines
  ctx.strokeStyle = '#2D2A26';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-100, 630);
  ctx.lineTo(800, 1054);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(-100, 770);
  ctx.lineTo(800, 1194);
  ctx.stroke();
  
  // Road dashed lanes
  ctx.strokeStyle = '#A67C52';
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 20]);
  ctx.beginPath();
  ctx.moveTo(-100, 700);
  ctx.lineTo(800, 1124);
  ctx.stroke();
  ctx.setLineDash([]); // Reset
  
  // Cozy park paths leading to waypoints (curved lines)
  ctx.strokeStyle = '#2D2A26';
  ctx.lineWidth = 4;
  ctx.setLineDash([6, 12]);
  
  // Path 1: start to rival
  ctx.beginPath();
  ctx.moveTo(184, 563);
  ctx.quadraticCurveTo(200, 480, 276, 460);
  ctx.stroke();
  
  // Path 2: rival to pond
  ctx.beginPath();
  ctx.moveTo(276, 460);
  ctx.quadraticCurveTo(420, 420, 574.5, 411.6);
  ctx.stroke();
  
  // Path 3: pond to comrades
  ctx.beginPath();
  ctx.moveTo(574.5, 411.6);
  ctx.lineTo(422, 401);
  ctx.stroke();
  
  // Path 4: rival to food
  ctx.beginPath();
  ctx.moveTo(276, 460);
  ctx.quadraticCurveTo(450, 600, 604, 665);
  ctx.stroke();
  
  // Path 5: food to pet
  ctx.beginPath();
  ctx.moveTo(604, 665);
  ctx.quadraticCurveTo(650, 640, 676, 600);
  ctx.stroke();
  
  // Path 6: pet to house
  ctx.beginPath();
  ctx.moveTo(676, 600);
  ctx.lineTo(754, 416);
  ctx.stroke();
  
  ctx.setLineDash([]); // Reset
  
  // Draw the Pond (cozy little blue pond)
  ctx.fillStyle = '#C2DCE3';
  ctx.strokeStyle = '#2D2A26';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(574.5, 411.6, 60, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Inner water reflections
  ctx.strokeStyle = '#FDFCF5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(564.5, 401.6, 30, 15, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Draw Garden Fence line
  ctx.strokeStyle = '#A67C52';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(350, 0);
  ctx.lineTo(1024, 500);
  ctx.stroke();
  
  // Draw small cute bushes/trees around map
  ctx.fillStyle = '#D1CCBC';
  const bushes = [
    { x: 400, y: 120 }, { x: 480, y: 150 },
    { x: 700, y: 450 }, { x: 820, y: 480 },
    { x: 620, y: 220 }, { x: 300, y: 350 }
  ];
  bushes.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 16, 0, Math.PI * 2);
    ctx.arc(b.x + 10, b.y - 8, 14, 0, Math.PI * 2);
    ctx.arc(b.x - 10, b.y - 5, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  
  // Draw Eleanor's Cottage roof footprint
  ctx.fillStyle = '#FDFCF5';
  ctx.strokeStyle = '#2D2A26';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.rect(760, 260, 120, 80);
  ctx.fill();
  ctx.stroke();
  
  // Chimney & Roof details
  ctx.fillStyle = '#E6E2D3';
  ctx.beginPath();
  ctx.moveTo(740, 290);
  ctx.lineTo(820, 230);
  ctx.lineTo(900, 290);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Text for labels on the board
  ctx.fillStyle = '#2D2A26';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("BAKER'S NOOK ALLEY", 184, 610);
  ctx.fillText("COZY COTTAGE", 754, 480);
  ctx.fillText("STRAY HIGHWAY", 200, 800);
  ctx.fillText("GARDEN POND", 574.5, 475);

  return canvas;
}

export function createCatTextureCanvas(avatarId: string, catName: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320; // Taller for upright cardboard standee look
  const ctx = canvas.getContext('2d')!;
  
  // White/beige rounded cardboard card look
  ctx.fillStyle = '#FDFCF5';
  ctx.beginPath();
  ctx.roundRect(8, 8, 240, 304, 16);
  ctx.fill();
  
  // Cardboard brown shadow border
  ctx.strokeStyle = '#2D2A26';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(8, 8, 240, 304, 16);
  ctx.stroke();

  ctx.strokeStyle = '#A67C52';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(14, 14, 228, 292, 12);
  ctx.stroke();

  // Define cat colors based on avatarId
  let bodyColor = '#f3f4f6';
  let stripeColor = '#d1d5db';
  let eyeColor = '#10b981';
  let noseColor = '#fda4af';
  
  if (avatarId === 'calico') {
    bodyColor = '#fef3c7';
    eyeColor = '#14b8a6';
  } else if (avatarId === 'tabby') {
    bodyColor = '#94a3b8';
    eyeColor = '#22c55e';
    stripeColor = '#334155';
  } else if (avatarId === 'black') {
    bodyColor = '#18181b';
    eyeColor = '#eab308';
    noseColor = '#3f3f46';
  } else if (avatarId === 'tuxedo') {
    bodyColor = '#0f172a';
    eyeColor = '#a3e635';
  }

  // Draw cat ears
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = '#2D2A26';
  ctx.lineWidth = 5;
  
  // Left ear
  ctx.beginPath();
  ctx.moveTo(70, 110);
  ctx.lineTo(50, 50);
  ctx.lineTo(105, 90);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Right ear
  ctx.beginPath();
  ctx.moveTo(186, 110);
  ctx.lineTo(206, 50);
  ctx.lineTo(151, 90);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner ears (pink)
  ctx.fillStyle = '#fda4af';
  ctx.beginPath();
  ctx.moveTo(75, 105);
  ctx.lineTo(60, 65);
  ctx.lineTo(100, 92);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(181, 105);
  ctx.lineTo(196, 65);
  ctx.lineTo(156, 92);
  ctx.closePath();
  ctx.fill();

  // Draw head
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = '#2D2A26';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(128, 135, 70, 55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Draw specific spots
  if (avatarId === 'calico') {
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(85, 110, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(165, 150, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(160, 110, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(80, 150, 16, 0, Math.PI * 2);
    ctx.fill();
  } else if (avatarId === 'tabby') {
    ctx.strokeStyle = stripeColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120, 88); ctx.lineTo(120, 105);
    ctx.moveTo(128, 85); ctx.lineTo(128, 103);
    ctx.moveTo(136, 88); ctx.lineTo(136, 105);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(65, 135); ctx.lineTo(85, 135);
    ctx.moveTo(62, 143); ctx.lineTo(82, 143);
    ctx.moveTo(191, 135); ctx.lineTo(171, 135);
    ctx.moveTo(194, 143); ctx.lineTo(174, 143);
    ctx.stroke();
  } else if (avatarId === 'tuxedo') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(128, 120);
    ctx.lineTo(105, 165);
    ctx.lineTo(151, 165);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(128, 150, 20, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eyes
  ctx.fillStyle = eyeColor;
  ctx.strokeStyle = '#2D2A26';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(100, 128, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(156, 128, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pupils
  ctx.fillStyle = '#2D2A26';
  ctx.beginPath();
  ctx.ellipse(100, 128, 3, 9, 0, 0, Math.PI * 2);
  ctx.ellipse(156, 128, 3, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(97, 124, 2.5, 0, Math.PI * 2);
  ctx.arc(153, 124, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = noseColor;
  ctx.beginPath();
  ctx.moveTo(124, 140);
  ctx.lineTo(132, 140);
  ctx.lineTo(128, 145);
  ctx.closePath();
  ctx.fill();

  // Mouth
  ctx.strokeStyle = '#2D2A26';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(121, 147, 7, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(135, 147, 7, 0, Math.PI);
  ctx.stroke();

  // Whiskers
  ctx.strokeStyle = avatarId === 'black' ? '#52525b' : '#A67C52';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(68, 142); ctx.lineTo(25, 138);
  ctx.moveTo(68, 147); ctx.lineTo(20, 149);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(188, 142); ctx.lineTo(231, 138);
  ctx.moveTo(188, 147); ctx.lineTo(236, 149);
  ctx.stroke();

  // Cute Paws at the bottom of the card
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = '#2D2A26';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(95, 230, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(161, 230, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Paw details
  ctx.fillStyle = '#2D2A26';
  ctx.beginPath();
  ctx.arc(95, 226, 6, 0, Math.PI * 2);
  ctx.arc(161, 226, 6, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(85, 215, 3.5, 0, Math.PI * 2);
  ctx.arc(95, 212, 3.5, 0, Math.PI * 2);
  ctx.arc(105, 215, 3.5, 0, Math.PI * 2);
  
  ctx.arc(151, 215, 3.5, 0, Math.PI * 2);
  ctx.arc(161, 212, 3.5, 0, Math.PI * 2);
  ctx.arc(171, 215, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Name on cardboard
  ctx.fillStyle = '#2D2A26';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(catName.toUpperCase(), 128, 275);
  ctx.font = 'italic 9px serif';
  ctx.fillStyle = '#A67C52';
  ctx.fillText('Stray Saga Companion', 128, 290);

  return canvas;
}

export function createWaypointTextureCanvas(letter: string, colorHex: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  
  // Card background
  ctx.fillStyle = '#FDFCF5';
  ctx.beginPath();
  ctx.arc(64, 64, 56, 0, Math.PI * 2);
  ctx.fill();
  
  // Outer circle border
  ctx.strokeStyle = '#2D2A26';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(64, 64, 56, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner colored circle
  ctx.fillStyle = colorHex;
  ctx.beginPath();
  ctx.arc(64, 64, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Letter in center
  ctx.fillStyle = '#FDFCF5'; // White text
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, 64, 64);
  
  return canvas;
}
