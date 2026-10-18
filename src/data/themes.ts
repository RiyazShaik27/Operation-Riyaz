export type VisualTheme = 'nocturne' | 'original' | 'ember';
export const THEME_LABELS: Record<VisualTheme, string> = {
  nocturne: 'Neon Nocturne',
  original: 'Original Cyan',
  ember: 'Ember Noir',
};
export const THEME_COLORS = {
  nocturne: { bg:'#090716',fog:'#100c21',ambient:'#7468ad',sky:'#9980ff',ground:'#09071b',spot:'#6aebed',left:'#9770fa',right:'#ff9a59',console:'#6ceddd',rim:'#ad7fff',warm:'#ffaf70',sparkle:'#b8a1ff',floor:'#352657',wall:'#160f2c',ceiling:'#1b1432' },
  original: { bg:'#030a12',fog:'#030c13',ambient:'#5b8197',sky:'#4ec5df',ground:'#02070c',spot:'#5dece2',left:'#168bb2',right:'#1ac6c8',console:'#68e9df',rim:'#27899e',warm:'#51d8d0',sparkle:'#77e4df',floor:'#0d1822',wall:'#08141e',ceiling:'#0d202d' },
  ember: { bg:'#100b12',fog:'#170e17',ambient:'#aa7258',sky:'#ffb477',ground:'#100a12',spot:'#f1b37b',left:'#ff8d5d',right:'#5cddd5',console:'#ffd197',rim:'#ff855b',warm:'#ffc087',sparkle:'#ffc390',floor:'#25151c',wall:'#1c1019',ceiling:'#281923' },
} as const;
