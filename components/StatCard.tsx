import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius } from '@/lib/theme';
import { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
  gradient: [string, string];
  style?: ViewStyle;
}

export function StatCard({ icon: Icon, label, value, subValue, gradient, style }: StatCardProps) {
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      <View style={styles.iconBg}>
        <Icon size={18} color={Colors.onColor} strokeWidth={2} />
      </View>
      <Text style={styles.value}>{value}</Text>
      {subValue && <Text style={styles.subValue}>{subValue}</Text>}
      <Text style={styles.label}>{label}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  value: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.onColor,
    marginTop: Spacing.sm,
  },
  subValue: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.regular,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  label: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: 'rgba(255,255,255,0.85)',
    marginTop: Spacing.xs,
  },
});
