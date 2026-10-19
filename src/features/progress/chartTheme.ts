/** Estilos comuns dos gráficos (funcionam no claro e no escuro) */
export const CHART_COLORS = {
  primary: '#10b981', // emerald-500
  secondary: '#f97316', // orange-500
  grid: 'rgba(148, 163, 184, 0.25)',
};

export const axisProps = {
  tick: { fill: 'currentColor', fontSize: 11 },
  stroke: 'currentColor',
  tickLine: false,
} as const;

export const tooltipStyle = {
  contentStyle: { borderRadius: 12, border: 'none', fontSize: 12, color: '#0f172a' },
} as const;
