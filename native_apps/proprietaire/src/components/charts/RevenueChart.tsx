import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;
const CHART_HEIGHT = 160;

interface RevenueHistory {
  month: string;
  amount: number;
}

interface RevenueChartProps {
  data: RevenueHistory[];
  title?: string;
  subtitle?: string;
}

export default function RevenueChart({ data, title, subtitle }: RevenueChartProps) {
  if (!data || data.length === 0) return null;

  const maxAmount = Math.max(...data.map(d => d.amount), 100000); // Fallback to 100k
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - (d.amount / maxAmount) * (CHART_HEIGHT - 20) - 10;
    return { x, y };
  });

  const pathData = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    // Spline curve effect
    const prev = points[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    return `${acc} C ${cp1x} ${prev.y}, ${cp1x} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const areaData = `${pathData} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title || 'Flux de Revenus mensuels'}</Text>
        <Text style={styles.subtitle}>{subtitle || `${data.length} derniers mois`}</Text>
      </View>

      <View style={styles.chartWrapper}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.2" />
              <Stop offset="1" stopColor={Colors.primary} stopOpacity="0" />
            </LinearGradient>
            <LinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={Colors.accent} />
              <Stop offset="1" stopColor={Colors.primary} />
            </LinearGradient>
          </Defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
            <Rect 
              key={i}
              x="0" 
              y={CHART_HEIGHT * p} 
              width={CHART_WIDTH} 
              height="1" 
              fill="rgba(0,0,0,0.03)" 
            />
          ))}

          {/* Area under line */}
          <Path d={areaData} fill="url(#grad)" />

          {/* Line */}
          <Path 
            d={pathData} 
            fill="none" 
            stroke={Colors.primary} 
            strokeWidth="3" 
            strokeLinecap="round"
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <Rect 
              key={i}
              x={p.x - 3}
              y={p.y - 3}
              width="6"
              height="6"
              rx="3"
              fill={Colors.white}
              stroke={Colors.primary}
              strokeWidth="2"
            />
          ))}
        </Svg>
      </View>

      <View style={styles.labelsRow}>
        {data.map((d, i) => (
          <Text key={i} style={styles.labelText}>{d.month}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  chartWrapper: {
    height: CHART_HEIGHT,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  labelText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.text.muted,
    textAlign: 'center',
  }
});
