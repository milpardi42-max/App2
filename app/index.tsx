import { Redirect } from 'expo-router';

/** Dedicated phone-2 APK: always enter the companion experience. */
export default function Index() {
  return <Redirect href="/agent" />;
}
