import { Tabs } from 'expo-router';
import { StyleSheet, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LayoutDashboard,
  Activity,
  Command,
  AppWindow,
  ShieldCheck,
  Smartphone,
} from 'lucide-react-native';
import { Colors, Typography } from '@/lib/theme';

function TabBarIcon({ icon: Icon, color, focused }: { icon: typeof LayoutDashboard; color: string; focused: boolean }) {
  // Keep this as a plain icon — the custom wrapper View with an absolutely
  // positioned indicator was pushing icons outside the tab bar frame on the
  // device (especially with large system font scale).
  return <Icon size={23} color={color} strokeWidth={focused ? 2.5 : 2} />;
}

export default function TabLayout() {
  // The phone's system navigation bar (gesture / 3-button) overlaps the
  // bottom of the app on Android 15+ (edge-to-edge). Adding its height to the
  // tab bar keeps the icons AND their Persian labels fully visible above it.
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'web' ? 0 : insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 68 + bottomInset,
            paddingBottom: 8 + bottomInset,
          },
        ],
        tabBarActiveTintColor: Colors.accent[700],
        tabBarInactiveTintColor: Colors.neutral[400],
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'داشبورد',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={LayoutDashboard} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'فعالیت',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={Activity} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="apps"
        options={{
          title: 'برنامه‌ها',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={AppWindow} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="controls"
        options={{
          title: 'کنترل',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={Command} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="security"
        options={{
          title: 'امنیت',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={ShieldCheck} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: 'دریافت',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={Smartphone} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.neutral[850],
    borderTopColor: Colors.neutral[800],
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    borderTopWidth: 1,
    paddingTop: 4,
    // react-native-screens renders the tab bar in its own native view, so the
    // top-level RTL wrapper doesn't reach it — make the tab bar RTL explicitly
    // (dashboard appears on the right, like a Persian app should).
    direction: 'rtl',
  },
  tabLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
