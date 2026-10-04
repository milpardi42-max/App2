import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing } from '@/lib/theme';
import { LucideIcon } from 'lucide-react-native';
import { DeviceSelector } from './DeviceSelector';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, icon: Icon }: ScreenHeaderProps) {
  return (
    <LinearGradient
      colors={[Colors.neutral[850], Colors.neutral[950]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {Icon && (
            <View style={styles.iconWrap}>
              <Icon size={22} color={Colors.accent[600]} strokeWidth={2} />
            </View>
          )}
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
      </View>
      <View style={styles.selectorWrap}>
        <DeviceSelector />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.accent[500] + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent[500] + '30',
  },
  title: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
  },
  subtitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.regular,
    color: Colors.neutral[400],
    marginTop: 2,
  },
  selectorWrap: {
    marginTop: Spacing.xs,
  },
});
