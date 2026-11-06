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

function BookstoreScene() {
  return (
    <>
      <rect x="18" y="20" width="168" height="244" rx="12" fill="#A97458" />
      <rect x="28" y="32" width="148" height="52" rx="5" fill="#8E5F49" opacity="0.55" />
      <rect x="28" y="94" width="148" height="52" rx="5" fill="#8E5F49" opacity="0.55" />
      <rect x="28" y="156" width="148" height="52" rx="5" fill="#8E5F49" opacity="0.55" />
      <rect x="28" y="218" width="148" height="34" rx="5" fill="#8E5F49" opacity="0.55" />
      <g>
        <rect x="38" y="44" width="13" height="36" rx="2" fill="#F15B72" />
        <rect x="54" y="50" width="11" height="30" rx="2" fill="#FFE9A8" />
        <rect x="68" y="40" width="15" height="40" rx="2" fill="#DCCBFF" />
        <rect x="86" y="48" width="10" height="32" rx="2" fill="#8FC9B7" />
        <rect x="100" y="42" width="14" height="38" rx="2" fill="#F6B7C7" />
        <rect x="120" y="50" width="12" height="30" rx="2" fill="#FFE9A8" />
        <rect x="138" y="44" width="16" height="36" rx="2" fill="#B9A6E0" />
      </g>
      <g>
        <rect x="38" y="108" width="16" height="36" rx="2" fill="#B9A6E0" />
        <rect x="58" y="114" width="12" height="30" rx="2" fill="#F6B7C7" />
        <rect x="74" y="104" width="13" height="40" rx="2" fill="#F15B72" />
        <rect x="90" y="112" width="15" height="32" rx="2" fill="#8FC9B7" />
        <rect x="110" y="106" width="11" height="38" rx="2" fill="#FFE9A8" />
        <rect x="126" y="114" width="14" height="30" rx="2" fill="#DCCBFF" />
        <rect x="144" y="108" width="12" height="36" rx="2" fill="#F6B7C7" />
      </g>
      <g>
        <rect x="38" y="170" width="12" height="34" rx="2" fill="#FFE9A8" />
        <rect x="54" y="176" width="15" height="28" rx="2" fill="#F15B72" />
        <rect x="74" y="166" width="12" height="38" rx="2" fill="#8FC9B7" />
        <rect x="90" y="174" width="14" height="30" rx="2" fill="#DCCBFF" />
        <rect x="108" y="168" width="13" height="36" rx="2" fill="#F6B7C7" />
        <rect x="126" y="176" width="12" height="28" rx="2" fill="#B9A6E0" />
        <rect x="142" y="170" width="14" height="34" rx="2" fill="#F15B72" />
      </g>
      <rect x="214" y="44" width="144" height="116" rx="12" fill="#FFF3E3" opacity="0.75" />
      <path d="M286 44v116M214 102h144" stroke="#C9A38E" strokeWidth="4" opacity="0.45" />
      <circle cx="356" cy="72" r="24" fill="#FFE9A8" />
      <path d="M356 96v82" stroke="#8E5F49" strokeWidth="5" strokeLinecap="round" />
      <rect x="330" y="176" width="52" height="10" rx="5" fill="#8E5F49" />
      <rect x="226" y="196" width="126" height="68" rx="16" fill="#B9A6E0" />
      <rect x="240" y="210" width="42" height="34" rx="9" fill="#DCCBFF" />
      <rect x="296" y="210" width="42" height="34" rx="9" fill="#DCCBFF" />
      <path d="M252 188c2-8 10-6 10 1 0 5-7 9-10 11-3-2-10-6-10-11 0-7 8-9 10-1Z" fill="#F15B72" opacity="0.85" />
      <rect x="24" y="264" width="352" height="10" rx="5" fill="#8E5F49" opacity="0.45" />
    </>
  );
}

function CherryBlossomScene() {
  return (
    <>
      <circle cx="318" cy="62" r="34" fill="#FFF3D2" opacity="0.9" />
      <path d="M0 232c58-26 110-22 158 2 54 26 104-18 148-12 38 5 68 18 94 24v54H0Z" fill="#C9E4C5" />
      <path d="M78 264c22-72 20-146 26-210M84 132c-20-18-38-28-58-34M88 158c24-16 44-22 68-24M92 92c-16-14-30-22-48-26" stroke="#8E6A58" strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M322 264c-16-68-10-140-2-198M318 138c18-18 34-26 52-32M314 168c-18-12-32-18-50-20" stroke="#8E6A58" strokeWidth="9" strokeLinecap="round" fill="none" />
      <g fill="#F6B7C7">
        <circle cx="24" cy="92" r="28" />
        <circle cx="54" cy="76" r="24" />
        <circle cx="76" cy="102" r="26" />
        <circle cx="108" cy="88" r="22" />
        <circle cx="40" cy="124" r="20" />
        <circle cx="126" cy="120" r="26" />
      </g>
      <g fill="#F9D5DF">
        <circle cx="332" cy="98" r="24" />
        <circle cx="360" cy="82" r="28" />
        <circle cx="382" cy="114" r="22" />
        <circle cx="312" cy="124" r="20" />
        <circle cx="352" cy="128" r="22" />
        <circle cx="282" cy="106" r="18" />
      </g>
      <g fill="#F15B72" opacity="0.65">
        <path d="M164 62c2-5 8-3 8 2 0 4-6 8-8 10-2-2-8-6-8-10 0-5 6-7 8-2Z" />
        <path d="M278 54c2-5 8-3 8 2 0 4-6 8-8 10-2-2-8-6-8-10 0-5 6-7 8-2Z" />
        <path d="M218 120c2-4 7-2 7 2 0 3-5 6-7 8-2-2-7-5-7-8 0-4 5-6 7-2Z" />
        <path d="M142 168c2-4 7-2 7 2 0 3-5 6-7 8-2-2-7-5-7-8 0-4 5-6 7-2Z" />
      </g>
      <path d="M156 300c18-34 34-52 54-68 26 20 42 44 54 68Z" fill="#F4E4D5" opacity="0.85" />
    </>
  );
}

function BeachPicnicScene() {
  return (
    <>
      <circle cx="336" cy="62" r="40" fill="#FFE9A8" />
      <circle cx="336" cy="62" r="56" fill="#FFE9A8" opacity="0.28" />
      <path d="M0 186c42-16 80-16 122 0 40 15 80 15 120 0 52-20 106-20 158-2v116H0Z" fill="#A9D8E8" />
      <path d="M0 206c58-10 104-10 158 4 52 14 100 12 148 0 34-8 64-8 94-4v94H0Z" fill="#8EC8DB" opacity="0.75" />
      <path d="M0 242c46-8 90-6 136 6 54 14 112 14 164 0 38-10 70-10 100-6v58H0Z" fill="#F6DFB8" />
      <path d="M108 232c54-18 118-18 176 0l-24 56H132Z" fill="#FFF8F0" />
      <path d="M130 240h142M124 252h154M118 264h166" stroke="#F6B7C7" strokeWidth="8" opacity="0.7" />
      <rect x="182" y="244" width="44" height="26" rx="7" fill="#C98E79" />
      <path d="M182 252h44" stroke="#A97458" strokeWidth="4" />
      <circle cx="226" cy="258" r="12" fill="#A97458" />
      <path d="M110 230c4-14 12-22 24-26" stroke="#F15B72" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="108" cy="232" r="6" fill="#F15B72" />
      <rect x="262" y="218" width="22" height="34" rx="7" fill="#FFFDF9" />
      <path d="M284 226h7a8 8 0 0 1 0 16h-7" stroke="#FFFDF9" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M268 208c-5-8 6-10 1-18M278 206c-5-8 6-10 1-18" stroke="#FFFDF9" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
      <g fill="#FFF8F0" opacity="0.8">
        <path d="M74 84c6-6 12-6 18 0M108 68c6-6 12-6 18 0" stroke="#FFF8F0" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
      <g fill="#F15B72" opacity="0.55">
        <path d="M58 264c2-4 7-2 7 2 0 3-5 6-7 8-2-2-7-5-7-8 0-4 5-6 7-2Z" />
        <path d="M330 244c2-4 7-2 7 2 0 3-5 6-7 8-2-2-7-5-7-8 0-4 5-6 7-2Z" />
      </g>
    </>
  );
}

function CityNightScene() {
  return (
    <>
      <circle cx="330" cy="56" r="26" fill="#FFF3D2" opacity="0.9" />
      <circle cx="320" cy="50" r="24" fill="#35395E" />
      <g fill="#35395E">
        <rect x="0" y="118" width="68" height="152" />
        <rect x="76" y="82" width="54" height="188" />
        <rect x="138" y="136" width="74" height="134" />
        <rect x="220" y="96" width="58" height="174" />
        <rect x="286" y="146" width="52" height="124" />
        <rect x="346" y="112" width="54" height="158" />
      </g>
      <g fill="#FFD98A">
        <rect x="14" y="136" width="12" height="16" rx="2" />
        <rect x="40" y="166" width="12" height="16" rx="2" />
        <rect x="88" y="104" width="10" height="14" rx="2" />
        <rect x="106" y="132" width="10" height="14" rx="2" />
        <rect x="154" y="158" width="12" height="16" rx="2" />
        <rect x="184" y="190" width="12" height="16" rx="2" />
        <rect x="236" y="118" width="10" height="14" rx="2" />
        <rect x="256" y="152" width="10" height="14" rx="2" />
        <rect x="300" y="174" width="12" height="16" rx="2" />
        <rect x="360" y="136" width="12" height="16" rx="2" />
        <rect x="382" y="176" width="12" height="16" rx="2" />
      </g>
      <g fill="#F6B7C7">
        <rect x="28" y="196" width="12" height="14" rx="2" />
        <rect x="90" y="168" width="10" height="14" rx="2" />
        <rect x="162" y="208" width="12" height="16" rx="2" />
        <rect x="242" y="184" width="10" height="14" rx="2" />
        <rect x="306" y="210" width="12" height="16" rx="2" />
        <rect x="366" y="208" width="12" height="16" rx="2" />
      </g>
      <rect x="128" y="236" width="104" height="16" rx="8" fill="#F15B72" opacity="0.9" />
      <path d="M152 244h56" stroke="#FFF3D2" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
      <rect x="116" y="260" width="128" height="40" rx="7" fill="#2B2E4E" opacity="0.7" />
      <path d="M0 270h400" stroke="#F6B7C7" strokeWidth="3" opacity="0.35" />
      <g stroke="#FFD98A" strokeWidth="3" strokeLinecap="round" opacity="0.55">
        <path d="M60 270v22M180 272v18M300 270v24M356 272v20" />
      </g>
      <g fill="#F15B72" opacity="0.6">
        <path d="M202 104c2-4 7-2 7 2 0 3-5 6-7 8-2-2-7-5-7-8 0-4 5-6 7-2Z" />
      </g>
    </>
  );
}

function RooftopScene() {
  return (
    <>
      <g fill="#FFF3D2">
        <circle cx="52" cy="44" r="2.4" />
        <circle cx="104" cy="74" r="1.8" />
        <circle cx="154" cy="38" r="2.2" />
        <circle cx="218" cy="62" r="1.6" />
        <circle cx="288" cy="34" r="2.4" />
        <circle cx="352" cy="66" r="2" />
        <circle cx="378" cy="30" r="1.7" />
        <circle cx="242" cy="96" r="1.6" />
      </g>
      <circle cx="318" cy="62" r="30" fill="#FFF3D2" opacity="0.9" />
      <circle cx="306" cy="54" r="28" fill="#3B3A63" />
      <g fill="#2A2B4D">
        <rect x="16" y="184" width="54" height="70" />
        <rect x="80" y="160" width="42" height="94" />
        <rect x="132" y="198" width="66" height="56" />
        <rect x="208" y="172" width="46" height="82" />
        <rect x="264" y="202" width="58" height="52" />
        <rect x="332" y="178" width="52" height="76" />
      </g>
      <g fill="#FFD98A" opacity="0.7">
        <rect x="28" y="198" width="8" height="10" rx="2" />
        <rect x="90" y="174" width="8" height="10" rx="2" />
        <rect x="146" y="210" width="8" height="10" rx="2" />
        <rect x="220" y="186" width="8" height="10" rx="2" />
        <rect x="278" y="214" width="8" height="10" rx="2" />
        <rect x="344" y="192" width="8" height="10" rx="2" />
      </g>
      <rect x="0" y="252" width="400" height="12" fill="#2A2B4D" />
      <path d="M0 238h400M38 238v30M126 238v30M214 238v30M302 238v30M380 238v30" stroke="#8B89B8" strokeWidth="4" opacity="0.65" />
      <path d="M24 188c48 16 96 18 144 4 56-16 112-14 168 4" stroke="#FFD98A" strokeWidth="2" fill="none" opacity="0.7" />
      <g fill="#FFE9A8">
        <circle cx="52" cy="195" r="3" />
        <circle cx="108" cy="198" r="3" />
        <circle cx="170" cy="194" r="3" />
        <circle cx="232" cy="192" r="3" />
        <circle cx="296" cy="196" r="3" />
        <circle cx="354" cy="198" r="3" />
      </g>
      <rect x="154" y="220" width="92" height="26" rx="8" fill="#B9A6E0" />
      <rect x="168" y="210" width="26" height="14" rx="5" fill="#FFFDF9" />
      <rect x="204" y="210" width="26" height="14" rx="5" fill="#FFFDF9" />
      <path d="M168 206c-4-8 6-10 1-18M206 206c-4-8 6-10 1-18" stroke="#FFF8F0" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
    </>
  );
}

function FlowerMarketScene() {
  return (
    <>
      <circle cx="70" cy="56" r="34" fill="#FFE9A8" opacity="0.85" />
      <path d="M0 40h400v24H0Z" fill="#F6B7C7" opacity="0.7" />
      <path d="M20 40h46v24H20ZM112 40h46v24h-46ZM204 40h46v24h-46ZM296 40h46v24h-46Z" fill="#FFF8F0" opacity="0.75" />
      <rect x="20" y="128" width="168" height="16" rx="6" fill="#C98E79" />
      <rect x="212" y="128" width="168" height="16" rx="6" fill="#C98E79" />
      <rect x="28" y="144" width="152" height="76" rx="8" fill="#E9D6C1" />
      <rect x="220" y="144" width="152" height="76" rx="8" fill="#E9D6C1" />
      <g fill="#F15B72">
        <circle cx="56" cy="174" r="15" />
        <circle cx="86" cy="164" r="13" />
        <circle cx="112" cy="178" r="16" />
        <circle cx="142" cy="166" r="14" />
        <circle cx="166" cy="180" r="12" />
      </g>
      <g fill="#DCCBFF">
        <circle cx="248" cy="176" r="14" />
        <circle cx="278" cy="164" r="15" />
        <circle cx="306" cy="178" r="13" />
        <circle cx="334" cy="166" r="16" />
        <circle cx="360" cy="180" r="13" />
      </g>
      <g fill="#FFE9A8">
        <circle cx="70" cy="198" r="10" />
        <circle cx="132" cy="198" r="10" />
        <circle cx="292" cy="198" r="10" />
        <circle cx="346" cy="198" r="10" />
      </g>
      <path d="M44 220c30-10 64-10 96 0l-10 34H54ZM236 220c30-10 64-10 96 0l-10 34h-76Z" fill="#C98E79" opacity="0.8" />
      <rect x="248" y="254" width="72" height="24" rx="7" fill="#A97458" />
      <path d="M258 260h52M258 268h52" stroke="#E9D6C1" strokeWidth="3" />
      <g fill="#F6B7C7" opacity="0.75">
        <circle cx="190" cy="90" r="4" />
        <circle cx="374" cy="104" r="4" />
        <circle cx="32" cy="108" r="3" />
      </g>
    </>
  );
}

function AutumnScene() {
  return (
    <>
      <circle cx="88" cy="58" r="36" fill="#FFE9A8" opacity="0.9" />
      <path d="M0 232c58-28 112-24 162 2 54 28 106-16 150-12 34 3 62 16 88 22v56H0Z" fill="#D9A46E" />
      <path d="M0 260c64-20 112-10 168 8 52 17 100-8 142-6 32 2 60 12 90 16v22H0Z" fill="#C58F5C" opacity="0.8" />
      <path d="M72 264c18-76 14-150 20-214M76 136c-22-16-42-24-64-28M82 164c26-16 48-22 74-24M86 92c-16-14-30-20-48-24" stroke="#8A5B4F" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M330 264c-14-66-10-132-4-188M326 142c18-16 34-22 52-26M322 170c-18-12-34-18-52-20" stroke="#8A5B4F" strokeWidth="9" strokeLinecap="round" fill="none" />
      <g fill="#E9A15C">
        <circle cx="24" cy="94" r="28" />
        <circle cx="58" cy="78" r="24" />
        <circle cx="92" cy="102" r="26" />
        <circle cx="48" cy="126" r="20" />
        <circle cx="126" cy="118" r="24" />
      </g>
      <g fill="#F6C66A">
        <circle cx="306" cy="110" r="24" />
        <circle cx="338" cy="94" r="28" />
        <circle cx="372" cy="122" r="24" />
        <circle cx="350" cy="144" r="20" />
        <circle cx="386" cy="94" r="18" />
      </g>
      <g fill="#C9613F" opacity="0.8">
        <path d="M156 70c6-4 10 2 8 8-3 5-9 8-12 9-2-4-4-12 0-15 1-1 2-1 4-2Z" />
        <path d="M194 118c6-4 10 2 8 8-3 5-9 8-12 9-2-4-4-12 0-15 1-1 2-1 4-2Z" />
        <path d="M250 68c6-4 10 2 8 8-3 5-9 8-12 9-2-4-4-12 0-15 1-1 2-1 4-2Z" />
      </g>
      <path d="M144 236h104v10H144ZM154 246v32M238 246v32M154 256h84" stroke="#8A5B4F" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M182 220h28" stroke="#8A5B4F" strokeWidth="5" strokeLinecap="round" />
    </>
  );
}

function ArcadeScene() {
  return (
    <>
      <g fill="#3B3563">
        <rect x="18" y="66" width="112" height="206" rx="16" />
        <rect x="146" y="42" width="98" height="230" rx="16" />
        <rect x="264" y="78" width="118" height="194" rx="16" />
      </g>
      <rect x="34" y="88" width="80" height="58" rx="9" fill="#F6B7C7" />
      <rect x="166" y="64" width="58" height="46" rx="8" fill="#A9D8E8" />
      <rect x="282" y="100" width="82" height="58" rx="9" fill="#B9A6E0" />
      <g fill="#FFE9A8">
        <circle cx="54" cy="196" r="9" />
        <circle cx="90" cy="196" r="9" />
        <rect x="104" y="216" width="12" height="38" rx="5" />
      </g>
      <g fill="#F15B72">
        <circle cx="184" cy="158" r="10" />
        <rect x="176" y="178" width="12" height="38" rx="5" />
      </g>
      <g fill="#8FC9B7">
        <circle cx="310" cy="202" r="9" />
        <circle cx="344" cy="202" r="9" />
      </g>
      <path d="M18 254h364v18H18Z" fill="#2A2650" />
      <path d="M0 272h400v28H0Z" fill="#242043" />
      <g stroke="#F6B7C7" strokeWidth="3" strokeLinecap="round" opacity="0.65">
        <path d="M42 38h40M324 34h40M368 60h20M10 52h18" />
      </g>
      <g fill="#FFE9A8" opacity="0.8">
        <path d="M202 18c2-4 7-2 7 2 0 3-5 6-7 8-2-2-7-5-7-8 0-4 5-6 7-2Z" />
        <circle cx="380" cy="18" r="3" />
        <circle cx="22" cy="12" r="2" />
      </g>
      <g fill="#F15B72" opacity="0.75">
        <path d="M220 272c2-5 8-3 8 2 0 4-6 8-8 10-2-2-8-6-8-10 0-5 6-7 8-2Z" />
        <path d="M322 276c2-4 7-2 7 2 0 3-5 6-7 8-2-2-7-5-7-8 0-4 5-6 7-2Z" />
      </g>
    </>
  );
}

function MountainScene() {
  return (
    <>
      <circle cx="306" cy="66" r="34" fill="#FFF3D2" />
      <path d="M0 182 92 82l86 100 62-68 92 82 68-58v182H0Z" fill="#A9C4C7" opacity="0.75" />
      <path d="M0 214 76 128l82 86 70-62 88 74 84-54v128H0Z" fill="#8FB3A8" opacity="0.85" />
      <path d="M0 248 82 174l76 74 74-58 96 62 72-44v92H0Z" fill="#7BA38F" />
      <g fill="#FFF8F0" opacity="0.55">
        <path d="M0 206c62-10 118-10 178 2 60 12 120 10 222-6v18c-104 16-164 18-224 6-60-12-114-12-176-2Z" />
        <path d="M0 236c72-8 132-6 190 4 62 10 126 6 210-8v12c-86 14-150 18-212 8-58-10-116-12-188-4Z" />
      </g>
      <g fill="#4E7A6A">
        <path d="M64 250l18-46 18 46ZM92 258l14-36 14 36ZM304 250l18-48 18 48ZM334 258l14-38 14 38Z" />
      </g>
      <g stroke="#6D9290" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8">
        <path d="M170 86c8-6 16-6 24 0M202 74c7-5 14-5 21 0" />
      </g>
      <g fill="#FFF3D2">
        <circle cx="54" cy="34" r="2" />
        <circle cx="124" cy="56" r="1.6" />
        <circle cx="238" cy="30" r="2.2" />
        <circle cx="366" cy="50" r="1.8" />
      </g>
      <path d="M168 300c12-22 28-36 48-48 18 14 32 28 42 48Z" fill="#DCE8E6" opacity="0.7" />
    </>
  );
}

function SundayMorningScene() {
  return (
    <>
      <rect x="28" y="18" width="344" height="264" rx="18" fill="#FFF3E3" />
      <rect x="62" y="40" width="276" height="170" rx="12" fill="#BFD8E8" />
      <path d="M62 40h276v170H62Z" fill="#DCEAF2" opacity="0.5" />
      <path d="M200 40v170M62 126h276" stroke="#FFF8F0" strokeWidth="10" />
      <circle cx="284" cy="84" r="28" fill="#FFE9A8" />
      <path d="M62 210 140 138l64 50 58-70 76 64v28H62Z" fill="#A9C4C7" opacity="0.45" />
      <path d="M28 40c22 6 30 34 22 70M344 40c-22 6-30 34-22 70" stroke="#F6B7C7" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M28 210h344v72H28Z" fill="#F6E4D0" />
      <rect x="118" y="224" width="164" height="18" rx="9" fill="#C98E79" />
      <rect x="136" y="242" width="12" height="40" rx="5" fill="#A97458" />
      <rect x="252" y="242" width="12" height="40" rx="5" fill="#A97458" />
      <rect x="150" y="196" width="42" height="30" rx="9" fill="#FFFDF9" />
      <path d="M192 202h10a9 9 0 0 1 0 18h-10" stroke="#FFFDF9" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M160 186c-5-8 6-10 1-18M176 188c-5-8 6-10 1-18" stroke="#C9A38E" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.75" />
      <path d="M212 220c10-12 26-12 36 0-2 12-8 18-18 18s-16-6-18-18Z" fill="#E9A15C" />
      <path d="M224 212c4-4 10-4 14 0" stroke="#C98E79" strokeWidth="3" strokeLinecap="round" fill="none" />
      <rect x="268" y="200" width="42" height="26" rx="5" fill="#B9A6E0" transform="rotate(-4 289 213)" />
      <path d="M278 208h22M278 214h16" stroke="#FFF8F0" strokeWidth="2.5" strokeLinecap="round" />
      <g fill="#F15B72" opacity="0.55">
        <path d="M74 90c2-4 7-2 7 2 0 3-5 6-7 8-2-2-7-5-7-8 0-4 5-6 7-2Z" />
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
  bookstore: { background: "bg-[#E8CDB1]", content: <BookstoreScene /> },
  "cherry-blossom": {
    background: "bg-[#F8D7E3]",
    content: <CherryBlossomScene />,
  },
  "beach-picnic": {
    background: "bg-[#FBE6C8]",
    content: <BeachPicnicScene />,
  },
  "city-night": {
    background: "bg-[#35395E]",
    content: <CityNightScene />,
  },
  rooftop: { background: "bg-[#3B3A63]", content: <RooftopScene /> },
  "flower-market": {
    background: "bg-[#F6DDE3]",
    content: <FlowerMarketScene />,
  },
  autumn: { background: "bg-[#F6D9B8]", content: <AutumnScene /> },
  arcade: { background: "bg-[#2A2650]", content: <ArcadeScene /> },
  mountain: { background: "bg-[#DCE8E6]", content: <MountainScene /> },
  "sunday-morning": {
    background: "bg-[#F7E8D3]",
    content: <SundayMorningScene />,
  },
};

export type MemoryPhotoImage = {
  src: string;
  width: number;
  height: number;
  alt?: string;
};

export function MemoryPhoto({
  variant,
  image,
  className,
}: {
  variant: PhotoVariant;
  image?: MemoryPhotoImage | null;
  className?: string;
}) {
  const scene = scenes[variant];

  if (image?.src) {
    return (
      <div
        className={cn(
          "relative aspect-[4/3] w-full overflow-hidden rounded-[1.05rem] bg-[#F3E5DC]",
          className,
        )}
      >
        <img
          src={image.src}
          alt={image.alt ?? "A photo from this memory"}
          width={image.width}
          height={image.height}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/30" />
        <HeartShape className="absolute right-3 top-3 h-4 w-4 text-white/70 drop-shadow-sm" />
      </div>
    );
  }

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
