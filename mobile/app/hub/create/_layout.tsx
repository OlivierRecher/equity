import { Stack } from 'expo-router';

export default function CreateLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="name" />
            <Stack.Screen name="template" />
            <Stack.Screen name="invite" />
        </Stack>
    );
}
