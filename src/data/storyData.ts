import { Avatar, Scenario, Waypoint } from '../types';

export const AVATARS: Avatar[] = [
  {
    id: 'calico',
    name: 'Luna',
    breed: 'Calico',
    description: 'Curious and gentle, with beautiful patches of orange, black, and white. She is highly alert and moves with careful precision.',
    color: 'bg-amber-100 border-amber-300',
    textColor: 'text-amber-800',
    accentColor: '#d97706',
    portraitSvg: 'calico',
    startingStats: { energy: 75, warmth: 55, trust: 25 }
  },
  {
    id: 'tabby',
    name: 'Buster',
    breed: 'Grey',
    description: 'Brave and energetic, with a sleek, beautiful grey coat. He is quick on his feet and loves exploring narrow spaces.',
    color: 'bg-slate-200 border-slate-300',
    textColor: 'text-slate-800',
    accentColor: '#475569',
    portraitSvg: 'tabby',
    startingStats: { energy: 90, warmth: 40, trust: 15 }
  },
  {
    id: 'black',
    name: 'Shadow',
    breed: 'Bombay Black',
    description: 'Shy, quiet, and extremely stealthy with a sleek pitch-black coat and gold eyes. He blends into shadows to find safety.',
    color: 'bg-zinc-800 border-zinc-700',
    textColor: 'text-zinc-200',
    accentColor: '#18181b',
    portraitSvg: 'black',
    startingStats: { energy: 70, warmth: 65, trust: 10 }
  },
  {
    id: 'tuxedo',
    name: 'Cookie',
    breed: 'White Cat',
    description: 'Elegant and soft, sporting a beautiful pure white coat. Always optimistic and loves warm spots.',
    color: 'bg-stone-100 border-stone-300',
    textColor: 'text-stone-800',
    accentColor: '#ffffff',
    portraitSvg: 'tuxedo',
    startingStats: { energy: 65, warmth: 50, trust: 40 }
  }
];

export const WAYPOINTS: Waypoint[] = [
  {
    id: 'rival',
    name: 'The Territorial Rival',
    description: 'A dark path between fences where a territorial tomcat lurks.',
    x: 27, // Left garden path
    y: 45,
    color: 'bg-blue-500 border-blue-300 text-blue-100',
    glowColor: 'rgba(59, 130, 246, 0.65)',
    type: 'rival',
    scenarioId: 'rival'
  },
  {
    id: 'pond',
    name: 'Small Water Pond',
    description: 'A tiny, natural puddle-pond tucked near park bushes.',
    x: 56.1, // Center-top near water pond
    y: 40.2,
    color: 'bg-yellow-500 border-yellow-300 text-yellow-100',
    glowColor: 'rgba(234, 179, 8, 0.65)',
    type: 'pond',
    scenarioId: 'pond'
  },
  {
    id: 'comrades',
    name: 'Co-Stray Comrades',
    description: 'Beneath a wooden pallet inside a quiet thicket.',
    x: 41.2, // Upper brush area near garden
    y: 39.2,
    color: 'bg-orange-500 border-orange-300 text-orange-100',
    glowColor: 'rgba(249, 115, 22, 0.65)',
    type: 'comrades',
    scenarioId: 'comrades'
  },
  {
    id: 'food',
    name: 'Food Scraps',
    description: 'Near a park bench where humans dropped fish skins.',
    x: 59, // Bottom-center pathway
    y: 65,
    color: 'bg-green-500 border-green-300 text-green-100',
    glowColor: 'rgba(34, 197, 94, 0.65)',
    type: 'food',
    scenarioId: 'food'
  },
  {
    id: 'pet',
    name: 'A Gentle Pet?',
    description: 'A sunny residential sidewalk near the garden fence.',
    x: 66, // Right side path
    y: 58.6,
    color: 'bg-purple-500 border-purple-300 text-purple-100',
    glowColor: 'rgba(168, 85, 247, 0.65)',
    type: 'pet',
    scenarioId: 'pet'
  },
  {
    id: 'house',
    name: 'Ms. Eleanor’s House',
    description: 'The cozy cottage at the end of the road. Your final goal.',
    x: 73.6, // Top-right house steps
    y: 40.6,
    color: 'bg-red-500 border-red-300 text-red-100',
    glowColor: 'rgba(239, 68, 68, 0.65)',
    type: 'house',
    scenarioId: 'house'
  }
];

export const SCENARIOS: Record<string, Scenario> = {
  rival: {
    id: 'rival',
    title: 'Point A: The Territorial Rival',
    subtitle: 'Narrow Shadowed Pathway',
    pawColor: 'blue',
    lines: [
      {
        speaker: 'Narrator',
        text: '{{name}} slips into a narrow, shadowed pathway between two fences, searching for a quiet escape.',
        type: 'scene'
      },
      {
        speaker: 'System',
        text: 'A sharp, vibrating cat hiss echoes. Rapid, thumping heartbeat.',
        type: 'audio',
        action: 'hiss'
      },
      {
        speaker: 'Narrator',
        text: 'Suddenly, a massive, battle-scarred ginger tomcat drops from a dumpster, blocking the exit. His tail lashes aggressively, and his ears flatten.',
        type: 'scene'
      },
      {
        speaker: '{{name}}',
        text: 'Oh no... his scent is so sharp. He\'s huge.',
        type: 'thought'
      },
      {
        speaker: 'Ginger Rival',
        text: 'MRRR-OWWWR!',
        type: 'speech'
      },
      {
        speaker: '{{name}}',
        text: 'Meow! (Please, I\'m just passing through! I don\'t want your food! I\'m just small!)',
        type: 'speech'
      },
      {
        speaker: 'Narrator',
        text: 'The rival lunges, claws out! {{name}} frantically bolts sideways, squeezing through a tiny tear in a wire fence, scraping her flank.',
        type: 'scene'
      },
      {
        speaker: 'Narrator',
        text: 'Safe but exhausted, she hides behind a trash can, panting to catch her breath.',
        type: 'scene'
      },
      {
        speaker: '{{name}}',
        text: 'That was too close... my ears are burning. The streets are so unfriendly when you don\'t belong anywhere.',
        type: 'thought'
      }
    ]
  },
  pond: {
    id: 'pond',
    title: 'Mid-Way Oasis: The Small Water Pond',
    subtitle: 'A Quiet Puddle near Park Bushes',
    pawColor: 'yellow',
    lines: [
      {
        speaker: 'Narrator',
        text: 'Dehydrated and worn out from the chase, {{name}} discovers a small, natural puddle-pond tucked near some park bushes. The water is murky, but it reflects the afternoon sky.',
        type: 'scene'
      },
      {
        speaker: 'System',
        text: 'Soft lapping water sounds.',
        type: 'audio',
        action: 'water_lap'
      },
      {
        speaker: 'Narrator',
        text: '{{name}} dips her pink nose into the water, drinking eagerly.',
        type: 'scene'
      },
      {
        speaker: '{{name}}',
        text: 'Water! My throat feels like sandpaper. It tastes like dirt and old rain, but it stops the burning in my chest. Okay... deep breath. My paws are sore, but I can\'t stay in the open. Someone might see me.',
        type: 'thought'
      }
    ]
  },
  comrades: {
    id: 'comrades',
    title: 'Point B: Co-Stray Comrades',
    subtitle: 'Under a Wooden Pallet',
    pawColor: 'orange',
    lines: [
      {
        speaker: 'Narrator',
        text: 'Moving into the brush near the garden, {{name}} hears a faint, fragile chirping sound.',
        type: 'scene'
      },
      {
        speaker: 'System',
        text: 'Very faint, high-pitched kitten mews; soft comforting purrs.',
        type: 'audio',
        action: 'purr'
      },
      {
        speaker: 'Narrator',
        text: 'Beneath a discarded wooden pallet, she finds a tiny, pitch-black kitten huddled alone, soaked from the morning dew and shivering violently.',
        type: 'scene'
      },
      {
        speaker: '{{name}}',
        text: 'Hello? Are you all alone too?',
        type: 'speech'
      },
      {
        speaker: 'Black Kitten',
        text: 'Mew... cold. So cold. Where is Mama?',
        type: 'speech'
      },
      {
        speaker: 'Narrator',
        text: 'There is no food to give, so {{name}} does the only thing she can. She squeezes under the pallet and curls her little body entirely around the smaller kitten, tucking her chin over its head.',
        type: 'scene'
      },
      {
        speaker: '{{name}}',
        text: 'I don\'t know where she is, little one. But I\'m here right now. Let\'s share my fur.',
        type: 'thought'
      },
      {
        speaker: 'Narrator',
        text: 'They sit together for an hour, their tiny, rhythmic purrs overlapping to create a fragile moment of warmth in a cold world.',
        type: 'scene'
      }
    ]
  },
  food: {
    id: 'food',
    title: 'Point C: Food Scraps',
    subtitle: 'Under a Park Bench',
    pawColor: 'green',
    lines: [
      {
        speaker: 'Narrator',
        text: 'The scent of grease and salt fills the air. Near a park bench, a careless human has dropped a crumpled paper bag.',
        type: 'scene'
      },
      {
        speaker: 'Narrator',
        text: 'Inside the bag are a few discarded, dried fish skins.',
        type: 'scene'
      },
      {
        speaker: '{{name}}',
        text: 'Her pupils dilate as she spots the bag. She darts forward, grabbing a fish skin and chewing frantically, keeping her eyes darting left and right in case someone tries to steal it.',
        type: 'thought'
      },
      {
        speaker: '{{name}}',
        text: 'Food! Real food! It’s crunchy and salty and a little bit dirty, but it tastes like heaven. My belly is finally quiet. This is the best part of my whole day. Please, let there be more days like this.',
        type: 'thought'
      }
    ]
  },
  pet: {
    id: 'pet',
    title: 'Point D: A Gentle Pet?',
    subtitle: 'Residential Sidewalk',
    pawColor: 'purple',
    lines: [
      {
        speaker: 'Narrator',
        text: 'As {{name}} walks along the residential sidewalk, a giant shadow falls over her. She tenses, expecting a kick or a shouted "Shoo!"',
        type: 'scene'
      },
      {
        speaker: 'Narrator',
        text: 'But a human kneels down quietly. They don\'t reach out aggressively; instead, they extend a soft, open hand at her eye level.',
        type: 'scene'
      },
      {
        speaker: 'Kind Human',
        text: 'Well, hello there, little one. Aren\'t you a beautiful kitty? Where did you come from, sweet pea?',
        type: 'speech'
      },
      {
        speaker: '{{name}}',
        text: 'You smell like lavender... and warmth. You don\'t have a stick?',
        type: 'thought'
      },
      {
        speaker: 'Narrator',
        text: 'The human gently strokes the top of {{name}}\'s head, right between her ears. {{name}}\'s eyes close automatically, and she leans her entire weight into the hand, letting out a loud, rumbling purr.',
        type: 'scene'
      },
      {
        speaker: '{{name}}',
        text: 'Oh... that feels so good. I forgot what it feels like to be touched gently. Please don\'t stop.',
        type: 'thought'
      },
      {
        speaker: 'Narrator',
        text: 'The human sighs, stands up, and walks away into a building. {{name}} sits on the cold pavement, watching the door close.',
        type: 'scene'
      },
      {
        speaker: '{{name}}',
        text: 'They always leave. But the warmth stays on my fur. I want a hand that stays.',
        type: 'thought'
      }
    ]
  },
  house: {
    id: 'house',
    title: 'The Final Goal: Ms. Eleanor’s House',
    subtitle: 'A Warm Haven at the End of the Road',
    pawColor: 'red',
    lines: [
      {
        speaker: 'Narrator',
        text: 'Twilight turns into a freezing night. {{name}} climbs the wooden steps of a quiet house at the end of the road.',
        type: 'scene'
      },
      {
        speaker: 'Narrator',
        text: 'A bright, warm golden light pours from the porch lamp, illuminating a thick, woven welcome mat. Exhausted, her energy completely depleted, {{name}} collapses onto the mat and closes her eyes.',
        type: 'scene'
      },
      {
        speaker: 'System',
        text: 'A door opening creak; warm fireplace crackles; soft gasp of empathy.',
        type: 'audio',
        action: 'door_open'
      },
      {
        speaker: 'Ms. Eleanor',
        text: 'Oh my goodness! Look at you... you poor, sweet little thing. You\'re freezing.',
        type: 'speech'
      },
      {
        speaker: '{{name}}',
        text: 'Meow... I\'m so tired of running from the metal beasts. I\'m so tired of the cold. Please.',
        type: 'speech'
      },
      {
        speaker: 'Narrator',
        text: 'A pair of gentle hands scoop {{name}} up, wrapping her completely in a thick, fluffy towel that smells like laundry and safety.',
        type: 'scene'
      },
      {
        speaker: 'Narrator',
        text: 'The camera fades to black and re-opens inside a cozy, glowing living room.',
        type: 'scene'
      },
      {
        speaker: 'Narrator',
        text: '{{name}} is sleeping soundly on a plush bed right next to a warm radiator, with a clean bowl of food beside her.',
        type: 'scene'
      },
      {
        speaker: '{{name}}',
        text: 'It’s so warm here. No rain can touch me. No big cats can chase me. The scary road is on the other side of the glass. I have a name now. I have a bowl with my name on it. I don\'t have to be a street cat anymore... I am finally safe.',
        type: 'thought'
      }
    ]
  }
};
