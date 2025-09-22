import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 👇 Skip redirect if we are already on /setup-admin
    if (pathname === '/setup-admin') return;

    if (!isLoading) {
      if (user) {
        if (user.role === 'admin') {
          router.replace('/(admin)');
        } else {
          router.replace('/(staff)');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, pathname]);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
});
