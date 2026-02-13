import type { Preset } from './types';
import { defaultTheme } from './default';
import { cedar_oakTheme } from './cedar-oak';
import { sage_greenTheme } from './sage-green';
import { crimson_flameTheme } from './crimson-flame';
import { vapor_waveTheme } from './vapor-wave';
import { gothicTheme } from './gothic';
import { pastelTheme } from './pastel';
import { horrorTheme } from './horror';
import { prideTheme } from './pride';
import { yukoTheme } from './yuko';
import { hokusaiTheme } from './hokusai';
import { nonameTheme } from './noname';
import { sadikovicTheme } from './sadikovic';
import { afbTheme } from './afb';
import { tufTheme } from './tuf';
import { royboyTheme } from './royboy';
import { dalmatianTheme } from './dalmatian';
import { queridaTheme } from './querida';
import { risTheme } from './ris';
import { guluTheme } from './gulu';
import { maxineTheme } from './maxine';
import { sunriseTheme } from './sunrise';
import { noirTheme } from './noir';
import { hatsuneTheme } from './hatsune';
import { trippieTheme } from './trippie';
import { scotlandTheme } from './scotland';
import { pbrTheme } from './pbr';
import { reesesTheme } from './reeses';
import { falloutTheme } from './fallout';
import { bergeTheme } from './berge';
import { samsonTheme } from './samson';
import { companionTheme } from './companion';
import { gustoTheme } from './gusto';
import { pinkTheme } from './pink';
import { dayglowTheme } from './dayglow';
import { kingTheme } from './king';
import { facecrusherTheme } from './facecrusher';
import { planetTheme } from './planet';
import { visserTheme } from './visser';
import { yolandiTheme } from './yolandi';
import { skolavorTheme } from './skolavor';
import { icelandTheme } from './iceland';

// Built-in preset themes
export const builtInPresets: Preset[] = [
  {
    id: 'default',
    name: 'Midnight Blue',
    theme: defaultTheme,
  },
  {
    id: 'cedar-oak',
    name: 'Cedar Oak',
    theme: cedar_oakTheme,
  },
  {
    id: 'sage-green',
    name: 'Sage Green',
    theme: sage_greenTheme,
  },
  {
    id: 'crimson-flame',
    name: 'Crimson Flame',
    theme: crimson_flameTheme,
  },
  {
    id: 'vapor-wave',
    name: 'Vapor Wave',
    theme: vapor_waveTheme,
  },
  {
    id: 'gothic',
    name: 'Gothic',
    theme: gothicTheme,
  },
  {
    id: 'pastel',
    name: 'Pastel',
    theme: pastelTheme,
  },
  {
    id: 'horror',
    name: 'Horror',
    theme: horrorTheme,
  },
  {
    id: 'pride',
    name: 'Pride',
    theme: prideTheme,
  },
  {
    id: 'yuko',
    name: 'Yuko',
    theme: yukoTheme,
  },
  {
    id: 'hokusai',
    name: 'Hokusai',
    theme: hokusaiTheme,
  },
  {
    id: 'noname',
    name: 'Noname',
    theme: nonameTheme,
  },
  {
    id: 'sadikovic',
    name: 'Sadikovic',
    theme: sadikovicTheme,
  },
  {
    id: 'afb',
    name: 'AFB',
    theme: afbTheme,
  },
  {
    id: 'tuf',
    name: 'TUF',
    theme: tufTheme,
  },
  {
    id: 'royboy',
    name: 'Royboy',
    theme: royboyTheme,
  },
  {
    id: 'dalmatian',
    name: 'Dalmatian',
    theme: dalmatianTheme,
  },
  {
    id: 'querida',
    name: 'Querida',
    theme: queridaTheme,
  },
  {
    id: 'ris',
    name: 'Ris',
    theme: risTheme,
  },
  {
    id: 'gulu',
    name: 'Gulu',
    theme: guluTheme,
  },
  {
    id: 'maxine',
    name: 'Maxine',
    theme: maxineTheme,
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    theme: sunriseTheme,
  },
  {
    id: 'noir',
    name: 'Noir',
    theme: noirTheme,
  },
  {
    id: 'hatsune',
    name: 'Hatsune',
    theme: hatsuneTheme,
  },
  {
    id: 'trippie',
    name: 'Trippie',
    theme: trippieTheme,
  },
  {
    id: 'scotland',
    name: 'Scotland',
    theme: scotlandTheme,
  },
  {
    id: 'pbr',
    name: 'PBR',
    theme: pbrTheme,
  },
  {
    id: 'reeses',
    name: 'Reeses',
    theme: reesesTheme,
  },
  {
    id: 'fallout',
    name: 'Fallout',
    theme: falloutTheme,
  },
  {
    id: 'berge',
    name: 'Bergé',
    theme: bergeTheme,
  },
  {
    id: 'samson',
    name: 'Samson',
    theme: samsonTheme,
  },
  {
    id: 'companion',
    name: 'Companion',
    theme: companionTheme,
  },
  {
    id: 'gusto',
    name: 'Gusto',
    theme: gustoTheme,
  },
  {
    id: 'pink',
    name: 'Pink',
    theme: pinkTheme,
  },
  {
    id: 'dayglow',
    name: 'Dayglow',
    theme: dayglowTheme,
  },
  {
    id: 'king',
    name: 'King',
    theme: kingTheme,
  },
  {
    id: 'facecrusher',
    name: 'Facecrusher',
    theme: facecrusherTheme,
  },
  {
    id: 'planet',
    name: 'Planet',
    theme: planetTheme,
  },
  {
    id: 'visser',
    name: 'Visser',
    theme: visserTheme,
  },
  {
    id: 'yolandi',
    name: 'Yolandi',
    theme: yolandiTheme,
  },
  {
    id: 'skolavor',
    name: 'Skolavor',
    theme: skolavorTheme,
  },
  {
    id: 'iceland',
    name: 'Iceland',
    theme: icelandTheme,
  },
];
