import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)));
const normal={
  left:'M84 111C84 101 90 96 99 96C108 96 114 101 114 111C114 121 108 126 99 126C90 126 84 121 84 111Z',
  right:'M142 111C142 101 148 96 157 96C166 96 172 101 172 111C172 121 166 126 157 126C148 126 142 121 142 111Z',
  mouth:'M108 157C120 164 136 164 148 157',
  body:'M128 34C181 34 216 72 216 128C216 184 181 222 128 222C75 222 40 184 40 128C40 72 75 34 128 34Z',
};
const expressions=[
  {id:'awake',name:'Awake',accent:'#61F6FF',accent2:'#62A8FF',tilt:0,y:-4,body:'M128 34C181 34 216 72 216 128C216 184 181 222 128 222C75 222 40 184 40 128C40 72 75 34 128 34Z',
    left:'M82 109C82 95 89 88 100 88C111 88 118 95 118 109C118 123 111 130 100 130C89 130 82 123 82 109Z',right:'M138 109C138 95 145 88 156 88C167 88 174 95 174 109C174 123 167 130 156 130C145 130 138 123 138 109Z',mouth:'M108 156C120 166 136 166 148 156'},
  {id:'curious',name:'Curious',accent:'#65FFD0',accent2:'#5BD9FF',tilt:-8,y:-2,body:'M126 35C178 32 214 70 216 125C218 180 184 219 132 222C80 225 43 188 40 133C37 78 74 38 126 35Z',
    left:'M83 108C83 93 90 86 100 86C110 86 116 93 116 108C116 123 110 130 100 130C90 130 83 123 83 108Z',right:'M145 109C145 98 151 92 159 92C167 92 172 98 172 109C172 120 167 126 159 126C151 126 145 120 145 109Z',mouth:'M112 158C121 153 136 153 145 158'},
  {id:'happy',name:'Happy',accent:'#FFD34E',accent2:'#FF8A3D',tilt:2,y:-5,body:'M128 34C169 34 185 44 194 57C206 74 212 98 216 128C212 158 206 182 194 199C185 212 169 222 128 222C87 222 71 212 62 199C50 182 44 158 40 128C44 98 50 74 62 57C71 44 87 34 128 34Z',
    left:'M82 117C91 99 105 99 116 117C107 108 91 108 82 117C82 117 82 117 82 117Z',right:'M140 117C149 99 163 99 174 117C165 108 149 108 140 117C140 117 140 117 140 117Z',mouth:'M102 151C116 176 140 176 154 151'},
  {id:'surprised',name:'Surprised',accent:'#F8FAFF',accent2:'#8BC8FF',tilt:0,y:-8,body:'M128 34C181 34 216 72 216 128C216 184 181 222 128 222C75 222 40 184 40 128C40 72 75 34 128 34Z',
    left:'M79 108C79 90 87 81 100 81C113 81 121 90 121 108C121 126 113 135 100 135C87 135 79 126 79 108Z',right:'M135 108C135 90 143 81 156 81C169 81 177 90 177 108C177 126 169 135 156 135C143 135 135 126 135 108Z',mouth:'M116 151C122 169 134 169 140 151'},
  {id:'focused',name:'Focused',accent:'#31E7F4',accent2:'#2B8DFF',tilt:0,y:1,body:'M128 34C181 34 216 72 216 128C216 184 181 222 128 222C75 222 40 184 40 128C40 72 75 34 128 34Z',
    left:'M82 109C90 101 105 99 117 104C110 112 94 116 82 109C82 109 82 109 82 109Z',right:'M139 104C151 99 166 101 174 109C162 116 146 112 139 104C139 104 139 104 139 104Z',mouth:'M108 158C120 156 136 156 148 158'},
  {id:'tired',name:'Tired',accent:'#8FA6D8',accent2:'#6672B7',tilt:-3,y:6,body:'M128 34C181 34 216 72 216 128C216 184 181 222 128 222C75 222 40 184 40 128C40 72 75 34 128 34Z',
    left:'M83 116C91 109 105 109 115 116C108 125 91 125 83 116C83 116 83 116 83 116Z',right:'M141 116C151 109 165 109 173 116C165 125 148 125 141 116C141 116 141 116 141 116Z',mouth:'M108 163C120 156 136 156 148 163'},
  {id:'confused',name:'Confused',accent:'#B98AFF',accent2:'#6B67FF',tilt:7,y:0,body:'M131 35C183 38 217 77 214 132C211 187 175 222 123 221C71 220 37 181 40 126C43 71 79 32 131 35Z',
    left:'M82 108C82 94 89 87 100 87C111 87 118 94 118 108C118 122 111 129 100 129C89 129 82 122 82 108Z',right:'M147 112C147 104 152 100 159 100C166 100 171 104 171 112C171 120 166 124 159 124C152 124 147 120 147 112Z',mouth:'M108 157C120 164 136 151 148 158'},
  {id:'angry',name:'Angry',accent:'#FF4864',accent2:'#FF7B38',tilt:0,y:2,body:'M128 34C181 34 216 72 216 128C216 184 181 222 128 222C75 222 40 184 40 128C40 72 75 34 128 34Z',
    left:'M81 104C93 99 108 102 117 111C104 117 89 114 81 104C81 104 81 104 81 104Z',right:'M139 111C148 102 163 99 175 104C167 114 152 117 139 111C139 111 139 111 139 111Z',mouth:'M105 166C119 153 137 153 151 166'},
];

const orbExpressions=[
  {id:'orb-wonder',name:'Wonder',accent:'#8CEBFF',zoom:1.13,panX:-5,panY:5,tilt:-5,left:[96,104,13,22],right:[143,96,13,22],mouth:'M117 157C123 164 133 164 139 157'},
  {id:'orb-excited',name:'Excited',accent:'#FFD65A',zoom:1.16,panX:0,panY:7,tilt:3,left:[93,99,14,25],right:[149,99,14,25],mouth:'M108 151C118 174 138 174 148 151'},
  {id:'orb-shy',name:'Shy',accent:'#FF92C9',zoom:1.1,panX:7,panY:-1,tilt:7,left:[98,113,11,15],right:[148,108,11,15],mouth:'M117 160C124 157 132 157 139 160'},
  {id:'orb-skeptical',name:'Skeptical',accent:'#B69AFF',zoom:1.12,panX:-6,panY:1,tilt:-6,left:[94,109,14,10],right:[150,104,10,17],mouth:'M113 159C121 154 135 154 143 160'},
  {id:'orb-sleepy',name:'Sleepy',accent:'#829BE0',zoom:1.08,panX:5,panY:-4,tilt:5,left:[96,116,14,7],right:[148,116,14,7],mouth:'M113 162C122 157 134 157 143 162'},
  {id:'orb-alarmed',name:'Alarmed',accent:'#FF6B68',zoom:1.18,panX:0,panY:9,tilt:0,left:[91,94,15,28],right:[150,94,15,28],mouth:'M119 157C119 146 137 146 137 157'},
];

const ghostBots=[
  {id:'ghost-pink',name:'Pink Comet · Joy',body:'#FF4B9D',light:'#FFB7DA',dark:'#A90C63',glow:'#FF3DA5',tilt:-12,panX:7,eyeShift:4,leftEye:[103,103,14,9,5],rightEye:[147,103,14,9,5],mouth:'M106 150C119 174 137 174 150 150'},
  {id:'ghost-orange',name:'Solar Puff · Surprise',body:'#FF9D16',light:'#FFE07A',dark:'#C94D00',glow:'#FFB21C',tilt:11,panX:-7,eyeShift:-3,leftEye:[99,86,16,36,8],rightEye:[145,86,16,36,8],mouth:'M117 151C123 169 133 169 139 151'},
  {id:'ghost-cyan',name:'Cyan Drift · Curiosity',body:'#13CDEB',light:'#A5FAFF',dark:'#087BAE',glow:'#19E7FF',tilt:-10,panX:6,eyeShift:5,leftEye:[104,88,14,31,7],rightEye:[148,99,13,18,7],mouth:'M112 157C123 151 136 154 145 161'},
  {id:'ghost-violet',name:'Violet Hush · Shy',body:'#8D5CFF',light:'#D9C8FF',dark:'#452099',glow:'#A77BFF',tilt:9,panX:-5,eyeShift:-3,leftEye:[104,101,12,16,6],rightEye:[148,101,12,16,6],mouth:'M118 159C124 156 132 156 138 159'},
  {id:'ghost-lime',name:'Lime Doze · Sleepy',body:'#7DDC35',light:'#D7FF9A',dark:'#337D19',glow:'#91F04B',tilt:-8,panX:5,eyeShift:2,leftEye:[103,107,15,7,4],rightEye:[147,107,15,7,4],mouth:'M113 161C122 156 134 156 143 161'},
  {id:'ghost-red',name:'Red Flare · Angry',body:'#F0444F',light:'#FFADB2',dark:'#8F101E',glow:'#FF4054',tilt:7,panX:-6,eyeShift:-2,leftEye:[102,102,16,8,3],rightEye:[146,102,16,8,3],mouth:'M107 165C120 151 136 151 149 165'},
];

const antennaBots=[
  {id:'antenna-beacon',name:'Beacon · Alert',body:'#FFD447',light:'#FFF2A3',dark:'#B56A00',glow:'#FFD94E',tilt:-5,panX:4,gaze:5,eyeH:24,antenna:-10},
  {id:'antenna-blush',name:'Blush · Friendly',body:'#FF79AD',light:'#FFD0E2',dark:'#A51E5A',glow:'#FF79B6',tilt:6,panX:-4,gaze:-3,eyeH:12,antenna:12},
  {id:'antenna-azure',name:'Azure · Curious',body:'#45BFFF',light:'#C7F0FF',dark:'#1266B2',glow:'#42C8FF',tilt:-9,panX:6,gaze:7,eyeH:27,antenna:-14},
  {id:'antenna-ember',name:'Ember · Excited',body:'#FF743D',light:'#FFD0A9',dark:'#A82A12',glow:'#FF7641',tilt:8,panX:-6,gaze:-5,eyeH:30,antenna:15},
  {id:'antenna-mint',name:'Mint · Calm',body:'#55D7B2',light:'#C8FFEE',dark:'#137A68',glow:'#57E9C1',tilt:-3,panX:3,gaze:2,eyeH:17,antenna:-6},
  {id:'antenna-volt',name:'Volt · Focused',body:'#B9F13D',light:'#EDFFAB',dark:'#5A9212',glow:'#C6FF43',tilt:4,panX:-3,gaze:-2,eyeH:8,antenna:8},
];

const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;');
function svg(e){
  const times='0;.18;.58;.76;1';
  const vals=(a,b)=>`${a};${a};${b};${b};${a}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-labelledby="title desc">
  <title id="title">Expressive sphere bot — ${esc(e.name)}</title><desc id="desc">A soft three-dimensional bot animates from neutral to peak ${esc(e.name.toLowerCase())} and returns to neutral in five seconds.</desc>
  <defs>
    <radialGradient id="body" cx="35%" cy="24%" r="82%"><stop stop-color="#34435F"/><stop offset=".34" stop-color="#1D293F"/><stop offset=".76" stop-color="#0A1020"/><stop offset="1" stop-color="#050811"/></radialGradient>
    <linearGradient id="edge" x1="48" y1="35" x2="207" y2="216" gradientUnits="userSpaceOnUse"><stop stop-color="#DAFFFF"/><stop offset=".28" stop-color="${e.accent}"/><stop offset=".72" stop-color="${e.accent2}"/><stop offset="1" stop-color="${e.accent}"/></linearGradient>
    <radialGradient id="shine" cx="35%" cy="0%" r="85%"><stop stop-color="#FFFFFF" stop-opacity=".28"/><stop offset=".55" stop-color="#8FCBFF" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="195%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="${e.accent}" flood-opacity=".22"/><feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="${e.accent}" flood-opacity=".68"/></filter>
    <filter id="face-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <g filter="url(#glow)"><animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 ${e.y};0 ${e.y};0 0" keyTimes="${times}" dur="5s" repeatCount="indefinite"/>
    <g><animateTransform attributeName="transform" type="rotate" values="0 128 128;0 128 128;${e.tilt} 128 128;${e.tilt} 128 128;0 128 128" keyTimes="${times}" dur="5s" repeatCount="indefinite"/>
      <path d="${normal.body}" fill="url(#body)" stroke="url(#edge)" stroke-width="4"><animate attributeName="d" values="${vals(normal.body,e.body)}" keyTimes="${times}" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1"/></path>
      <path d="${normal.body}" fill="url(#shine)" opacity=".72"><animate attributeName="d" values="${vals(normal.body,e.body)}" keyTimes="${times}" dur="5s" repeatCount="indefinite"/></path>
      <path d="M72 66C98 43 151 41 181 60" fill="none" stroke="#FFF" stroke-width="5" stroke-linecap="round" opacity=".16"/>
      <g fill="#F8FFFF" filter="url(#face-glow)"><path d="${normal.left}"><animate attributeName="d" values="${vals(normal.left,e.left)}" keyTimes="${times}" dur="5s" repeatCount="indefinite"/></path><path d="${normal.right}"><animate attributeName="d" values="${vals(normal.right,e.right)}" keyTimes="${times}" dur="5s" repeatCount="indefinite"/></path></g>
      <path d="${normal.mouth}" fill="none" stroke="#F4FFFF" stroke-width="6" stroke-linecap="round"><animate attributeName="d" values="${vals(normal.mouth,e.mouth)}" keyTimes="${times}" dur="5s" repeatCount="indefinite"/></path>
    </g>
  </g>
</svg>\n`;
}

function orbSvg(e){
  const times='0;.18;.58;.76;1';
  const seq=(start,peak)=>`${start};${start};${peak};${peak};${start}`;
  const [lx,ly,lrx,lry]=e.left,[rx,ry,rrx,rry]=e.right;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-labelledby="title desc">
  <title id="title">Expressive 3D orb — ${esc(e.name)}</title><desc id="desc">A softly lit spherical bot moves from neutral to peak ${esc(e.name.toLowerCase())} while the camera pans and zooms, then returns to neutral.</desc>
  <defs>
    <radialGradient id="orb" cx="31%" cy="24%" r="78%"><stop offset="0" stop-color="#FFFDF7"/><stop offset=".3" stop-color="#F1EEE7"/><stop offset=".68" stop-color="#C9C5BE"/><stop offset="1" stop-color="#77746F"/></radialGradient>
    <radialGradient id="soft-light" cx="28%" cy="15%" r="70%"><stop stop-color="#FFF" stop-opacity=".72"/><stop offset=".48" stop-color="#FFF" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <linearGradient id="eye" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#202329"/><stop offset="1" stop-color="#050609"/></linearGradient>
    <filter id="orb-shadow" x="-45%" y="-45%" width="190%" height="205%"><feDropShadow dx="0" dy="13" stdDeviation="12" flood-color="#000" flood-opacity=".48"/><feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="${e.accent}" flood-opacity=".2"/></filter>
    <filter id="eye-depth" x="-70%" y="-70%" width="240%" height="240%"><feDropShadow dx="1" dy="2" stdDeviation="1.8" flood-color="#000" flood-opacity=".55"/></filter>
  </defs>
  <g>
    <animateTransform attributeName="transform" type="translate" values="0 0;0 0;${e.panX} ${e.panY};${e.panX} ${e.panY};0 0" keyTimes="${times}" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1"/>
    <g transform="translate(128 128)"><g><animateTransform attributeName="transform" type="scale" values="1;1;${e.zoom};${e.zoom};1" keyTimes="${times}" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1"/>
      <g transform="translate(-128 -128)">
        <g filter="url(#orb-shadow)"><animateTransform attributeName="transform" type="rotate" values="0 128 128;0 128 128;${e.tilt} 128 128;${e.tilt} 128 128;0 128 128" keyTimes="${times}" dur="5s" repeatCount="indefinite"/>
          <circle cx="128" cy="126" r="82" fill="url(#orb)"/>
          <circle cx="128" cy="126" r="82" fill="url(#soft-light)"/>
          <path d="M77 73C99 51 137 43 166 56" fill="none" stroke="#FFF" stroke-width="6" stroke-linecap="round" opacity=".28"/>
          <g fill="url(#eye)" filter="url(#eye-depth)">
            <ellipse cx="99" cy="108" rx="12" ry="20"><animate attributeName="cx" values="${seq(99,lx)}" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><animate attributeName="cy" values="${seq(108,ly)}" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><animate attributeName="rx" values="${seq(12,lrx)}" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><animate attributeName="ry" values="${seq(20,lry)}" keyTimes="${times}" dur="5s" repeatCount="indefinite"/></ellipse>
            <ellipse cx="157" cy="108" rx="12" ry="20"><animate attributeName="cx" values="${seq(157,rx)}" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><animate attributeName="cy" values="${seq(108,ry)}" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><animate attributeName="rx" values="${seq(12,rrx)}" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><animate attributeName="ry" values="${seq(20,rry)}" keyTimes="${times}" dur="5s" repeatCount="indefinite"/></ellipse>
          </g>
          <path d="M116 157C123 161 133 161 140 157" fill="none" stroke="#25272C" stroke-width="5" stroke-linecap="round" opacity=".88"><animate attributeName="d" values="${seq('M116 157C123 161 133 161 140 157',e.mouth)}" keyTimes="${times}" dur="5s" repeatCount="indefinite"/></path>
        </g>
      </g>
    </g></g>
  </g>
</svg>\n`;
}

function ghostSvg(e){
  const times='0;.18;.58;.78;1';
  const bodyRest='M128 39C168 39 194 68 194 108C194 153 176 187 151 202C138 211 118 211 105 202C80 187 62 153 62 108C62 68 88 39 128 39Z';
  const bodyPeak='M128 34C171 34 199 65 199 108C199 156 179 193 153 208C139 217 117 217 103 208C77 193 57 156 57 108C57 65 85 34 128 34Z';
  const [lex,ley,lew,leh,ler]=e.leftEye,[rex,rey,rew,reh,rer]=e.rightEye;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-labelledby="title desc">
  <title id="title">Floating neon mascot — ${esc(e.name)}</title><desc id="desc">A glossy ${esc(e.name.toLowerCase())} jelly mascot hovers, gestures with both arms, changes its eyes and moves closer to the camera in a five-second loop.</desc>
  <defs>
    <radialGradient id="body" cx="34%" cy="20%" r="82%"><stop stop-color="${e.light}"/><stop offset=".36" stop-color="${e.body}"/><stop offset=".78" stop-color="${e.body}"/><stop offset="1" stop-color="${e.dark}"/></radialGradient>
    <linearGradient id="visor" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#30384F"/><stop offset=".35" stop-color="#11182A"/><stop offset="1" stop-color="#03050A"/></linearGradient>
    <radialGradient id="shine" cx="30%" cy="15%" r="62%"><stop stop-color="#FFF" stop-opacity=".72"/><stop offset=".4" stop-color="#FFF" stop-opacity=".08"/><stop offset="1" stop-color="#FFF" stop-opacity="0"/></radialGradient>
    <filter id="float-shadow" x="-45%" y="-45%" width="190%" height="210%"><feDropShadow dx="0" dy="13" stdDeviation="11" flood-color="#000" flood-opacity=".62"/><feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="${e.glow}" flood-opacity=".48"/></filter>
    <filter id="eye-glow" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="256" height="256" rx="28" fill="#05070D"/>
  <g><animateTransform attributeName="transform" type="translate" values="0 3;0 3;${e.panX} -8;${e.panX} -8;0 3" keyTimes="${times}" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1"/>
    <g transform="translate(128 128)"><g><animateTransform attributeName="transform" type="scale" values="1;1;1.08;1.08;1" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><g transform="translate(-128 -128)" filter="url(#float-shadow)">
      <g><animateTransform attributeName="transform" type="rotate" values="0 128 128;0 128 128;${e.tilt} 128 128;${e.tilt} 128 128;0 128 128" keyTimes="${times}" dur="5s" repeatCount="indefinite"/>
        <path d="${bodyRest}" fill="url(#body)"><animate attributeName="d" values="${bodyRest};${bodyRest};${bodyPeak};${bodyPeak};${bodyRest}" keyTimes="${times}" dur="5s" repeatCount="indefinite"/></path>
        <path d="${bodyRest}" fill="url(#shine)" opacity=".65"><animate attributeName="d" values="${bodyRest};${bodyRest};${bodyPeak};${bodyPeak};${bodyRest}" keyTimes="${times}" dur="5s" repeatCount="indefinite"/></path>
        <path d="M93 48C113 38 143 39 158 49" fill="none" stroke="#FFF" stroke-width="6" stroke-linecap="round" opacity=".36"/>
        <g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;${e.eyeShift} -2;${e.eyeShift} -2;0 0" keyTimes="${times}" dur="5s" repeatCount="indefinite"/>
          <rect x="76" y="72" width="108" height="62" rx="26" fill="url(#visor)" stroke="#424D69" stroke-width="3"/>
          <path d="M91 82C111 69 151 69 170 82" fill="none" stroke="#FFF" stroke-width="4" stroke-linecap="round" opacity=".14"/>
          <g fill="#F8FFFF" filter="url(#eye-glow)"><rect x="101" y="91" width="14" height="27" rx="7"><animate attributeName="x" values="101;101;${lex};${lex};101" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><animate attributeName="y" values="91;91;${ley};${ley};91" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><animate attributeName="width" values="14;14;${lew};${lew};14" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><animate attributeName="height" values="27;27;${leh};${leh};27" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><animate attributeName="rx" values="7;7;${ler};${ler};7" keyTimes="${times}" dur="5s" repeatCount="indefinite"/></rect><rect x="145" y="91" width="14" height="27" rx="7"><animate attributeName="x" values="145;145;${rex};${rex};145" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><animate attributeName="y" values="91;91;${rey};${rey};91" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><animate attributeName="width" values="14;14;${rew};${rew};14" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><animate attributeName="height" values="27;27;${reh};${reh};27" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><animate attributeName="rx" values="7;7;${rer};${rer};7" keyTimes="${times}" dur="5s" repeatCount="indefinite"/></rect></g>
        </g>
        <path d="M112 154C122 160 134 160 144 154" fill="none" stroke="#75043D" stroke-width="5" stroke-linecap="round"><animate attributeName="d" values="M112 154C122 160 134 160 144 154;M112 154C122 160 134 160 144 154;${e.mouth};${e.mouth};M112 154C122 160 134 160 144 154" keyTimes="${times}" dur="5s" repeatCount="indefinite"/></path>
      </g>
    </g></g></g>
  </g>
</svg>\n`;
}

function antennaSvg(e){
  const times='0;.18;.58;.78;1';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-labelledby="title desc">
  <title id="title">Realistic 3D antenna bot — ${esc(e.name)}</title><desc id="desc">A compact glossy ${esc(e.name.toLowerCase())} robot animates its antenna, eyes, body turn, legs and camera in a five-second loop.</desc>
  <defs>
    <radialGradient id="shell" cx="32%" cy="18%" r="84%"><stop stop-color="${e.light}"/><stop offset=".28" stop-color="${e.body}"/><stop offset=".72" stop-color="${e.body}"/><stop offset="1" stop-color="${e.dark}"/></radialGradient>
    <linearGradient id="shell-side" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${e.dark}"/><stop offset="1" stop-color="#11131A"/></linearGradient>
    <linearGradient id="visor" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#394156"/><stop offset=".25" stop-color="#161D2C"/><stop offset="1" stop-color="#03050A"/></linearGradient>
    <radialGradient id="shine" cx="28%" cy="8%" r="72%"><stop stop-color="#FFF" stop-opacity=".76"/><stop offset=".42" stop-color="#FFF" stop-opacity=".08"/><stop offset="1" stop-color="#FFF" stop-opacity="0"/></radialGradient>
    <filter id="ambient" x="-45%" y="-45%" width="190%" height="200%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000" flood-opacity=".58"/><feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="${e.glow}" flood-opacity=".35"/></filter>
    <filter id="eye-light" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="256" height="256" rx="28" fill="#08111F"/>
  <g><animateTransform attributeName="transform" type="translate" values="0 3;0 3;${e.panX} -5;${e.panX} -5;0 3" keyTimes="${times}" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1"/>
    <g transform="translate(128 128)"><g><animateTransform attributeName="transform" type="scale" values="1;1;1.07;1.07;1" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><g transform="translate(-128 -128)" filter="url(#ambient)">
      <g><animateTransform attributeName="transform" type="rotate" values="0 128 139;0 128 139;${e.tilt} 128 139;${e.tilt} 128 139;0 128 139" keyTimes="${times}" dur="5s" repeatCount="indefinite"/>
        <g id="legs">
          <rect x="87" y="179" width="30" height="43" rx="13" fill="url(#shell-side)"/><rect x="139" y="179" width="30" height="43" rx="13" fill="url(#shell-side)"/>
          <rect x="84" y="202" width="36" height="25" rx="12" fill="url(#shell)"/><rect x="136" y="202" width="36" height="25" rx="12" fill="url(#shell)"/>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 4;0 4;0 0" keyTimes="${times}" dur="5s" repeatCount="indefinite"/>
        </g>
        <rect x="55" y="65" width="151" height="132" rx="46" fill="url(#shell-side)" transform="translate(5 6)" opacity=".9"/>
        <rect x="50" y="59" width="151" height="132" rx="46" fill="url(#shell)"/>
        <rect x="50" y="59" width="151" height="132" rx="46" fill="url(#shine)" opacity=".66"/>
        <path d="M76 72C101 54 151 53 177 72" fill="none" stroke="#FFF" stroke-width="6" stroke-linecap="round" opacity=".34"/>
        <g id="antenna"><animateTransform attributeName="transform" type="rotate" values="0 128 61;0 128 61;${e.antenna} 128 61;${e.antenna} 128 61;0 128 61" keyTimes="${times}" dur="5s" repeatCount="indefinite"/>
          <rect x="124" y="29" width="8" height="39" rx="4" fill="url(#shell)"/><circle cx="128" cy="24" r="11" fill="url(#shell)"/><circle cx="124" cy="20" r="3" fill="#FFF" opacity=".55"/>
        </g>
        <g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;${e.gaze} 0;${e.gaze} 0;0 0" keyTimes="${times}" dur="5s" repeatCount="indefinite"/>
          <rect x="69" y="91" width="113" height="66" rx="29" fill="url(#visor)" stroke="#46516B" stroke-width="3"/>
          <path d="M84 102C108 87 150 88 169 102" fill="none" stroke="#FFF" stroke-width="4" stroke-linecap="round" opacity=".15"/>
          <g fill="#F9FFFF" filter="url(#eye-light)">
            <ellipse cx="104" cy="124" rx="12" ry="18"><animate attributeName="cy" values="124;124;121;121;124" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><animate attributeName="ry" values="18;18;${e.eyeH};${e.eyeH};18" keyTimes="${times}" dur="5s" repeatCount="indefinite"/></ellipse>
            <ellipse cx="148" cy="124" rx="12" ry="18"><animate attributeName="cy" values="124;124;121;121;124" keyTimes="${times}" dur="5s" repeatCount="indefinite"/><animate attributeName="ry" values="18;18;${e.eyeH};${e.eyeH};18" keyTimes="${times}" dur="5s" repeatCount="indefinite"/></ellipse>
          </g>
        </g>
        <rect x="92" y="173" width="22" height="8" rx="4" fill="${e.glow}" opacity=".45"/><rect x="137" y="173" width="22" height="8" rx="4" fill="${e.glow}" opacity=".45"/>
      </g>
    </g></g></g>
  </g>
</svg>\n`;
}
mkdirSync(root,{recursive:true});
for(const expression of expressions) writeFileSync(resolve(root,`${expression.id}.svg`),svg(expression));
for(const expression of orbExpressions) writeFileSync(resolve(root,`${expression.id}.svg`),orbSvg(expression));
for(const bot of ghostBots) writeFileSync(resolve(root,`${bot.id}.svg`),ghostSvg(bot));
for(const bot of antennaBots) writeFileSync(resolve(root,`${bot.id}.svg`),antennaSvg(bot));
console.log(`Generated ${expressions.length} dark sphere bots, ${orbExpressions.length} expressive 3D orbs, ${ghostBots.length} floating neon mascots, and ${antennaBots.length} realistic antenna bots.`);
