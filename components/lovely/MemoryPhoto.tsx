import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { PhotoVariant } from "@/content/lovely";
import { HeartShape } from "./Doodles";

function CafeScene() {
  return (
    <>
      <circle cx="318" cy="74" r="46" fill="#FFE7C7" />
      <rect x="238" y="20" width="146" height="150" rx="14" fill="#FFF3E3" opacity="0.55" />
      <path d="M311 20v150M238 96h146" stroke="#D9A98F" strokeWidth="4" opacity="0.55" />
      <rect x="22" y="222" width="356" height="18" rx="9" fill="#B98269" />
      <rect x="22" y="240" width="356" height="8" rx="4" fill="#A06F58" opacity="0.55" />
      <g>
        <rect x="108" y="171" width="58" height="46" rx="12" fill="#FFFDF9" />
        <path d="M166 180h13a11 11 0 0 1 0 22h-13" stroke="#FFFDF9" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M118 200h38" stroke="#F15B72" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        <path d="M130 160c-6-8 7-12 1-20M146 160c-6-8 7-12 1-20" stroke="#C98E79" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.7" />
      </g>
      <g>
        <rect x="222" y="178" width="52" height="40" rx="11" fill="#FFFDF9" />
        <path d="M274 185h11a10 10 0 0 1 0 20h-11" stroke="#FFFDF9" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M231 204h34" stroke="#DCCBFF" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
        <path d="M241 168c-6-8 7-12 1-20" stroke="#C98E79" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.7" />
      </g>
      <path d="M199 190c3-6 10-3 10 3 0 5-7 10-10 12-3-2-10-7-10-12 0-6 7-9 10-3Z" fill="#F15B72" opacity="0.85" />
      <rect x="316" y="192" width="30" height="30" rx="7" fill="#F6D7A6" transform="rotate(8 331 207)" />
      <circle cx="331" cy="207" r="7" fill="#E9A8A0" />
    </>
  );
}

function SunsetScene() {
  return (
    <>
      <circle cx="206" cy="128" r="66" fill="#FFE9A8" />
      <circle cx="206" cy="128" r="88" fill="#FFE9A8" opacity="0.28" />
      <path d="M0 230c54-38 96-38 144-8 54 34 98-20 146-18 42 2 78 30 110 38v58H0Z" fill="#D9A0A8" opacity="0.85" />
      <path d="M0 258c62-30 106-18 150 6 48 26 92-12 140-8 40 3 76 18 110 22v22H0Z" fill="#B98FA8" opacity="0.8" />
      <path d="M147 96c8-6 16-6 24 0M188 82c8-6 16-6 24 0" stroke="#9B7089" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.55" />
      <g opacity="0.95">
        <circle cx="270" cy="190" r="14" fill="#7E5C77" />
        <path d="M250 244c0-18 9-30 20-30s20 12 20 30Z" fill="#7E5C77" />
        <circle cx="300" cy="198" r="12" fill="#8C677F" />
        <path d="M284 244c0-15 7-25 16-25s16 10 16 25Z" fill="#8C677F" />
        <path d="M267 182c3-7 11-5 11 2 0 6-8 11-11 13-3-2-11-7-11-13 0-7 8-9 11-2Z" fill="#FFF8F0" opacity="0.9" transform="translate(1 -34) scale(0.65)" />
      </g>
      <g fill="#F15B72" opacity="0.55">
        <path d="M94 120c2-4 7-2 7 2 0 4-5 7-7 9-2-2-7-5-7-9 0-4 5-6 7-2Z" />
        <path d="M322 78c2-4 7-2 7 2 0 4-5 7-7 9-2-2-7-5-7-9 0-4 5-6 7-2Z" />
      </g>
    </>
  );
}

function RainScene() {
  return (
    <>
      <rect x="26" y="18" width="348" height="264" rx="18" fill="#F3ECDD" />
      <rect x="48" y="40" width="304" height="196" rx="10" fill="#96A6CF" />
      <path d="M200 40v196M48 138h304" stroke="#F3ECDD" strokeWidth="10" />
      <g stroke="#DCE6F7" strokeWidth="3" strokeLinecap="round" opacity="0.75">
        <path d="M78 70l-8 18M118 62l-8 18M160 82l-8 18M246 64l-8 18M292 76l-8 18M326 58l-8 18M98 106l-8 18M272 108l-8 18M318 118l-8 18M140 58l-8 18" />
      </g>
      <path d="M168 96c-20 13-31 36-31 55h92c0-19-11-42-31-55-8-5-22-5-30 0Z" fill="#F15B72" opacity="0.85" />
      <path d="M183 151v30" stroke="#A93D53" strokeWidth="4" strokeLinecap="round" />
      <circle cx="183" cy="186" r="5" fill="#A93D53" />
      <rect x="300" y="200" width="36" height="26" rx="6" fill="#DCCBFF" />
      <path d="M300 208h36" stroke="#B9A2E8" strokeWidth="3" />
      <path d="M32 252h336" stroke="#C9A38E" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      <g>
        <rect x="58" y="228" width="40" height="30" rx="8" fill="#FFFDF9" />
        <path d="M98 234h9a8 8 0 0 1 0 16h-9" stroke="#FFFDF9" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M66 246h24" stroke="#F15B72" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <path d="M74 218c-5-6 6-10 1-16" stroke="#C9A38E" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
      <path d="M232 250c4-8 13-4 13 4 0 7-9 13-13 16-4-3-13-9-13-16 0-8 9-12 13-4Z" fill="#F15B72" opacity="0.6" />
    </>
  );
}

function RoadtripScene() {
  return (
    <>
      <circle cx="90" cy="64" r="38" fill="#FFE9A8" />
      <g fill="#FFFDF9" opacity="0.85">
        <rect x="238" y="52" width="78" height="20" rx="10" />
        <rect x="260" y="42" width="38" height="20" rx="10" />
        <rect x="330" y="92" width="52" height="16" rx="8" opacity="0.7" />
      </g>
      <path d="M0 194c56-42 110-36 158-4 46 31 92-18 138-14 42 4 74 26 104 34v90H0Z" fill="#A9D8C8" />
      <path d="M0 220c68-24 112-10 164 10 46 18 100-10 148-6 32 3 62 16 88 20v56H0Z" fill="#8FC9B7" opacity="0.85" />
      <path d="M174 300 206 204h62l36 96Z" fill="#8E8AA8" />
      <path d="M226 300l6-24M240 254l4-18" stroke="#FFF8F0" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
      <g>
        <rect x="118" y="216" width="92" height="38" rx="14" fill="#F15B72" />
        <path d="M138 218c2-16 12-24 27-24s25 8 27 24Z" fill="#F58CA3" />
        <rect x="148" y="204" width="34" height="16" rx="6" fill="#FFF3E3" />
        <circle cx="140" cy="254" r="11" fill="#5F5570" />
        <circle cx="190" cy="254" r="11" fill="#5F5570" />
        <circle cx="140" cy="254" r="4" fill="#DCCBFF" />
        <circle cx="190" cy="254" r="4" fill="#DCCBFF" />
        <circle cx="120" cy="226" r="5" fill="#FFE9A8" />
        <path d="M104 224c-8 2-14 8-18 16" stroke="#F15B72" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M98 212c2-4 7-2 7 2 0 4-5 7-7 9-2-2-7-5-7-9 0-4 5-6 7-2Z" fill="#F15B72" opacity="0.6" />
      </g>
    </>
  );
}

function CozyScene() {
  return (
    <>
      <circle cx="320" cy="66" r="34" fill="#FFF3D2" />
      <circle cx="303" cy="56" r="32" fill="#D8CCF2" />
      <g fill="#FFF8F0" opacity="0.9">
        <circle cx="72" cy="46" r="2.6" />
        <circle cx="122" cy="76" r="2" />
        <circle cx="184" cy="38" r="2.4" />
        <circle cx="252" cy="70" r="1.8" />
        <circle cx="352" cy="126" r="2.4" />
        <path d="M96 108c2-4 7-2 7 2 0 4-5 7-7 9-2-2-7-5-7-9 0-4 5-6 7-2Z" />
      </g>
      <rect x="34" y="196" width="332" height="72" rx="24" fill="#B9A6E0" />
      <rect x="34" y="196" width="332" height="20" rx="10" fill="#C9B8EA" />
      <rect x="64" y="160" width="92" height="64" rx="18" fill="#C9B8EA" />
      <rect x="244" y="160" width="92" height="64" rx="18" fill="#C9B8EA" />
      <path d="M148 210c24-24 82-24 106 0-6 26-22 40-53 40s-47-14-53-40Z" fill="#F6B7C7" />
      <circle cx="178" cy="188" r="17" fill="#F2C7A8" />
      <path d="M161 184c2-12 10-18 19-18s15 6 15 14c-10-4-24-2-34 4Z" fill="#6B4E5A" />
      <circle cx="224" cy="192" r="15" fill="#EFC1A0" />
      <path d="M210 188c0-10 8-16 15-16 8 0 13 5 13 13-8-4-18-2-28 3Z" fill="#8A5B4F" />
      <path d="M186 198c2 2 6 2 8 0M218 200c2 2 6 2 8 0" stroke="#7C4F57" strokeWidth="2" strokeLinecap="round" />
      <path d="M205 206c3 3 7 3 10 0" stroke="#B9586F" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M168 224c18 9 50 9 68 0" stroke="#E193A8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
    </>
  );
}

function DanceScene() {
  return (
    <>
      <path d="M20 54c56 22 108 22 174 4 66-18 120-18 186 4" stroke="#B98FA8" strokeWidth="3" fill="none" opacity="0.55" />
      <g fill="#FFE9A8">
        <circle cx="54" cy="70" r="6" />
        <circle cx="108" cy="82" r="6" />
        <circle cx="166" cy="76" r="6" />
        <circle cx="238" cy="60" r="6" />
        <circle cx="296" cy="66" r="6" />
        <circle cx="352" cy="78" r="6" />
      </g>
      <path d="M0 252h400" stroke="#C98E9D" strokeWidth="4" opacity="0.45" />
      <g>
        <circle cx="192" cy="118" r="22" fill="#F0C3A4" />
        <path d="M170 114c0-16 10-24 22-24s22 8 22 24c-12-8-32-8-44 0Z" fill="#6B4E5A" />
        <path d="M192 140c-20 0-34 22-34 58v46h68v-46c0-36-14-58-34-58Z" fill="#F15B72" />
        <path d="M186 140c-17 11-27 26-38 44-5 8 6 15 12 7 10-15 19-25 32-33" fill="#F0C3A4" />
        <path d="M200 140c16 10 26 24 38 42 5 8-6 15-12 7-10-14-20-24-32-32" fill="#F0C3A4" />
        <path d="M170 244c0-20 10-30 22-30s22 10 22 30Z" fill="#D94360" opacity="0.55" />
      </g>
      <g>
        <circle cx="244" cy="142" r="18" fill="#EFC1A0" />
        <path d="M226 139c2-13 9-19 19-19 8 0 14 6 15 14-10-4-24-2-34 5Z" fill="#8A5B4F" />
        <path d="M244 160c-16 0-28 18-28 46v38h56v-38c0-28-12-46-28-46Z" fill="#DCCBFF" />
        <path d="M238 164c-12 9-20 19-30 32-5 7 5 13 10 6 10-13 17-20 27-26" fill="#EFC1A0" />
        <path d="M250 164c12 9 20 19 30 32 5 7-5 13-10 6-10-13-17-20-27-26" fill="#EFC1A0" />
      </g>
      <g fill="#FFF8F0" opacity="0.9">
        <path d="M96 158c-6 0-10-4-10-9 0-6 5-10 10-10 6 0 10 4 10 10v26c0 4-3 7-7 7s-7-3-7-7" stroke="#FFF8F0" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="318" cy="150" r="4" />
        <path d="M318 150v-26" stroke="#FFF8F0" strokeWidth="3.4" strokeLinecap="round" />
      </g>
      <g fill="#F15B72" opacity="0.6">
        <path d="M150 96c2-4 7-2 7 2 0 4-5 7-7 9-2-2-7-5-7-9 0-4 5-6 7-2Z" />
        <path d="M290 104c2-4 7-2 7 2 0 4-5 7-7 9-2-2-7-5-7-9 0-4 5-6 7-2Z" />
      </g>
    </>
  );
}

const scenes: Record<PhotoVariant, { background: string; content: ReactNode }> = {
  cafe: { background: "bg-[#F6D4BE]", content: <CafeScene /> },
  sunset: { background: "bg-[#F7C7B5]", content: <SunsetScene /> },
  rain: { background: "bg-[#CFD8F0]", content: <RainScene /> },
  roadtrip: { background: "bg-[#CFE8E0]", content: <RoadtripScene /> },
  cozy: { background: "bg-[#D8CCF2]", content: <CozyScene /> },
  dance: { background: "bg-[#F4C6D3]", content: <DanceScene /> },
};

export function MemoryPhoto({
  variant,
  className,
}: {
  variant: PhotoVariant;
  className?: string;
}) {
  const scene = scenes[variant];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-[1.05rem]",
        scene.background,
        className,
      )}
    >
      <svg
        viewBox="0 0 400 300"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {scene.content}
      </svg>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.38),transparent_46%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(#49343B 0.65px, transparent 0.65px)",
          backgroundSize: "5px 5px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/30" />
      <HeartShape className="absolute right-3 top-3 h-4 w-4 text-white/55" />
    </div>
  );
}
