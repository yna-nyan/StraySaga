import React from 'react';

export const Credits: React.FC = () => {
  return (
    <section className="max-w-6xl mx-auto w-full z-10 mt-12 mb-8 p-[16px] relative flex flex-col overflow-hidden rounded-[4px] bg-[#2d170b] border-t-2 border-l-2 border-[#412413] border-b-2 border-r-2 border-[#160a03] shadow-[0_16px_30px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.15),inset_0_-4px_10px_rgba(0,0,0,0.8)] before:absolute before:inset-[3px] before:border before:border-[#1c0e06] before:pointer-events-none">
      <div className="w-full p-6 md:p-8 flex flex-col relative overflow-hidden bg-[#e9dbbe] border-t border-l border-[#bda883] border-b border-r border-[#fbf2dd] shadow-[inset_0_4px_12px_rgba(43,23,10,0.35)] rounded-[2px]">
        
        {/* Inside Swirly Corners */}
        <div className="absolute top-1 left-1 w-14 h-14 pointer-events-none z-20 overflow-visible">
          <svg width="100%" height="100%" viewBox="0 0 40 40" className="overflow-visible opacity-80">
            <path d="M 2 35 A 33 33 0 0 1 35 2" fill="none" stroke="#7d633a" strokeWidth="1" />
            <path d="M 2 25 A 23 23 0 0 1 25 2" fill="none" stroke="#9e8254" strokeWidth="0.75" />
            <path d="M 2 2 Q 12 2 12 12 Q 12 18 6 18 Q 2 18 2 12 Q 2 8 6 8 Q 9 8 8 11" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
            <path d="M 2 2 Q 2 12 12 12 Q 18 12 18 6 Q 18 2 12 2 Q 8 2 8 6 Q 8 9 11 8" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
            <circle cx="18" cy="18" r="1.5" fill="#dfbe7b" stroke="#503a15" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute top-1 right-1 w-14 h-14 pointer-events-none z-20 overflow-visible transform scale-x-[-1]">
          <svg width="100%" height="100%" viewBox="0 0 40 40" className="overflow-visible opacity-80">
            <path d="M 2 35 A 33 33 0 0 1 35 2" fill="none" stroke="#7d633a" strokeWidth="1" />
            <path d="M 2 25 A 23 23 0 0 1 25 2" fill="none" stroke="#9e8254" strokeWidth="0.75" />
            <path d="M 2 2 Q 12 2 12 12 Q 12 18 6 18 Q 2 18 2 12 Q 2 8 6 8 Q 9 8 8 11" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
            <path d="M 2 2 Q 2 12 12 12 Q 18 12 18 6 Q 18 2 12 2 Q 8 2 8 6 Q 8 9 11 8" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
            <circle cx="18" cy="18" r="1.5" fill="#dfbe7b" stroke="#503a15" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-1 left-1 w-14 h-14 pointer-events-none z-20 overflow-visible transform scale-y-[-1]">
          <svg width="100%" height="100%" viewBox="0 0 40 40" className="overflow-visible opacity-80">
            <path d="M 2 35 A 33 33 0 0 1 35 2" fill="none" stroke="#7d633a" strokeWidth="1" />
            <path d="M 2 25 A 23 23 0 0 1 25 2" fill="none" stroke="#9e8254" strokeWidth="0.75" />
            <path d="M 2 2 Q 12 2 12 12 Q 12 18 6 18 Q 2 18 2 12 Q 2 8 6 8 Q 9 8 8 11" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
            <path d="M 2 2 Q 2 12 12 12 Q 18 12 18 6 Q 18 2 12 2 Q 8 2 8 6 Q 8 9 11 8" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
            <circle cx="18" cy="18" r="1.5" fill="#dfbe7b" stroke="#503a15" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-1 right-1 w-14 h-14 pointer-events-none z-20 overflow-visible transform scale-x-[-1] scale-y-[-1]">
          <svg width="100%" height="100%" viewBox="0 0 40 40" className="overflow-visible opacity-80">
            <path d="M 2 35 A 33 33 0 0 1 35 2" fill="none" stroke="#7d633a" strokeWidth="1" />
            <path d="M 2 25 A 23 23 0 0 1 25 2" fill="none" stroke="#9e8254" strokeWidth="0.75" />
            <path d="M 2 2 Q 12 2 12 12 Q 12 18 6 18 Q 2 18 2 12 Q 2 8 6 8 Q 9 8 8 11" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
            <path d="M 2 2 Q 2 12 12 12 Q 18 12 18 6 Q 18 2 12 2 Q 8 2 8 6 Q 8 9 11 8" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
            <circle cx="18" cy="18" r="1.5" fill="#dfbe7b" stroke="#503a15" strokeWidth="0.5" />
          </svg>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-editorial-ink font-serif text-center mb-6 border-b border-editorial-ink/20 pb-3">
           Production Credits & Stray Profiles
        </h2>
        
        {/* 4 Cats Profile Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 z-10">
           <div className="flex flex-col items-center text-center p-4 bg-editorial-bg border border-editorial-ink/10 rounded shadow-sm">
              <div className="p-2 bg-editorial-beige rounded-full border border-editorial-ink/15 shadow-inner overflow-hidden flex items-center justify-center">
                <img src="/creditcats/tiger.jpg" alt="Luna" className="w-20 h-20 rounded-full object-cover select-none pointer-events-none" />
              </div>
              <h3 className="font-bold text-sm text-editorial-ink mt-3">Tiger (Tilapia)</h3>
              <p className="text-[11px] text-editorial-ink/80 mt-2 italic font-serif leading-relaxed">
                 "I found this tiny cat in the middle of the night while I was on my way home, this poor kitty was in the middle of the road. 
                 It's pure heartbreaking to hear her meowing with all her might. Now she enjoys warm bed and I love her sooo much. - saki"
              </p>
           </div>
           
           <div className="flex flex-col items-center text-center p-4 bg-editorial-bg border border-editorial-ink/10 rounded shadow-sm">
              <div className="p-2 bg-editorial-beige rounded-full border border-editorial-ink/15 shadow-inner overflow-hidden flex items-center justify-center">
                <img src="/creditcats/sai.jpg" alt="Buster" className="w-20 h-20 rounded-full object-cover select-none pointer-events-none" />
              </div>
              <h3 className="font-bold text-sm text-editorial-ink mt-3">Pixel (White cat)</h3>
              <p className="text-[11px] text-editorial-ink/80 mt-2 italic font-serif leading-relaxed">
                "my cousin happened to pick up a stray cat from the streets a pregnant stray cat and he took care of it and when it gave birth, his family doesn't want him to keep all of the kittens and not wanting to abandon them he decided to give me 2 of those kittens - Sai"
              </p>
           </div>
           
           <div className="flex flex-col items-center text-center p-4 bg-editorial-bg border border-editorial-ink/10 rounded shadow-sm">
              <div className="p-2 bg-editorial-beige rounded-full border border-editorial-ink/15 shadow-inner overflow-hidden flex items-center justify-center">
                <img src="/creditcats/blacky.jpg" alt="Shadow" className="w-20 h-20 rounded-full object-cover select-none pointer-events-none" />
              </div>
              <h3 className="font-bold text-sm text-editorial-ink mt-3">Blacky (Black Cat)</h3>
              <p className="text-[11px] text-editorial-ink/80 mt-2 italic font-serif leading-relaxed">
                 "My sister found her in front of our old house! He's so skinny that and full of snot! Yet he meows so soft T_T It's really a miracle he survived! Today he's almost 7 year's old cat (he's already an adult cat when we adopted him) -saki"
              </p>
           </div>
           
           <div className="flex flex-col items-center text-center p-4 bg-editorial-bg border border-editorial-ink/10 rounded shadow-sm">
              <div className="p-2 bg-editorial-beige rounded-full border border-editorial-ink/15 shadow-inner overflow-hidden flex items-center justify-center">
                <img src="/creditcats/saisai.jpg" alt="Cookie" className="w-20 h-20 rounded-full object-cover select-none pointer-events-none" />
              </div>
              <h3 className="font-bold text-sm text-editorial-ink mt-3">Miming (Calico)</h3>
              <p className="text-[11px] text-editorial-ink/80 mt-2 italic font-serif leading-relaxed">
                "my cousin happened to pick up a stray cat from the streets a pregnant stray cat and he took care of it and when it gave birth, his family doesn't want him to keep all of the kittens and not wanting to abandon them he decided to give me 2 of those kittens - Sai"
              </p>
           </div>
        </div>
        
        {/* Dev Credits statements */}
        <div className="border-t border-editorial-ink/20 pt-6 text-xs text-editorial-ink/90 space-y-4 font-sans z-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <p className="font-bold uppercase tracking-wider text-[10px] text-editorial-ochre mb-1">Hackathon & Development</p>
                 <p className="leading-relaxed">This project was created for the <strong className="font-bold">HackTheKitty Hackaton 2026</strong>.</p>
                 <p className="leading-relaxed mt-2">This project utilized AI assistance (<strong className="font-bold">Kiro AI, and Claude</strong>) in development.</p>
                 <p className="leading-relaxed mt-2">Developers: <strong className="font-bold">
                  <a href="https://github.com/yna-nyan">yna-nyan(aka saki) </a>, and 
                  <a href="https://github.com/sairarat"> sairarat </a></strong></p>
              </div>
              <div>
                 <p className="font-bold uppercase tracking-wider text-[10px] text-editorial-ochre mb-1">Assets & Creative Contributions</p>
                 <p className="leading-relaxed">Images used in this project are from publicly available images (buttons, etc.).</p>
                 <p className="leading-relaxed mt-2">The map was sketched by the developers and used GPT image skill to turn it into a reality.</p>
                 <p className="leading-relaxed mt-2">Soundtrack: <em className="italic">Castle Drums - medieval lofi by CFL_TurningPages </em> from Pixabay.</p>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};
