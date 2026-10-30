// Stable IDs preserve saved selections; display names and genres are user supplied.
// Durations were measured from the original MP3 files with ffprobe.
const audioURL = filename => new URL(`../../audio/${filename}`, import.meta.url).href;
const coverURL = (id, extension = 'webp') => new URL(`./assets/covers/${id}.${extension}`, import.meta.url).href;
export const genres = ['House', 'Downtempo', 'Live'];
export const tracks = [
  { id: 'analog-bass', genre: 'House', title: 'Analog Bass', subtitle: '2:41', color: '#e6b34c', artwork: coverURL('analog-bass'), src: audioURL('analogBass.mp3'), duration: 161.619575 },
  { id: 'artificial-glass', genre: 'House', title: 'Artificial Glass', subtitle: '2:24', color: '#8ae5e5', artwork: coverURL('artificial-glass'), src: audioURL('artificialGlass.mp3'), duration: 144.535500 },
  { id: 'frostbitten-feet', genre: 'Downtempo', title: 'Frostbitten Feet', subtitle: '4:00', color: '#abcaf1', artwork: coverURL('frostbitten-feet'), src: audioURL('frostbittenFeet.mp3'), duration: 240.039175 },
  { id: 'minecraft-deathcore', genre: 'Downtempo', title: 'Minecraft Deathcore', subtitle: '2:43', color: '#ad92df', artwork: coverURL('minecraft-deathcore'), src: audioURL('minecraftDeathcore.mp3'), duration: 163.604900 },
  { id: 'slofi', genre: 'Downtempo', title: 'Slofi', subtitle: '1:43', color: '#dca99a', artwork: coverURL('slofi'), src: audioURL('slofi.mp3'), duration: 103.418775 },
  { id: 'wave-mobbin', genre: 'Downtempo', title: 'Wave Mobbin', subtitle: '3:43', color: '#64c5ca', artwork: coverURL('wave-mobbin'), src: audioURL('waveMobbin.mp3'), duration: 223.555900 },
  { id: 'among-us-d2-1', genre: 'House', title: 'Among Us', subtitle: '3:56', color: '#ee849e', artwork: coverURL('among-us-d2-1', 'svg'), src: audioURL('amongusd2.1.mp3'), duration: 236.068550 },
  { id: 'good-house-d2-2', genre: 'House', title: 'Jazz House', subtitle: '3:22', color: '#f2c96e', artwork: coverURL('good-house-d2-2', 'svg'), src: audioURL('goodhoused2.2.mp3'), duration: 202.135500 },
  { id: 'pew-pew-thirds', genre: 'Downtempo', title: 'Bass Chamber', subtitle: '0:46', color: '#9aefca', artwork: coverURL('pew-pew-thirds', 'svg'), src: audioURL('pew pew thirds.mp3'), duration: 46.315100 },
  { id: 'shoegaze-d2', genre: 'Live', title: 'Shoe 2', subtitle: '1:24', color: '#b4a3f3', artwork: coverURL('shoegaze-d2', 'svg'), src: audioURL('shoegaze d2.mp3'), duration: 84.741225 },
  { id: 'shoe-4', genre: 'Live', title: 'Shoe 4', subtitle: '4:01', color: '#f0a486', artwork: coverURL('shoe-4', 'svg'), src: audioURL('shoe 4.mp3'), duration: 241.162438 },
];
