import { Stack } from 'expo-router';

export default function HubLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="create" />
        </Stack>
    );
}
