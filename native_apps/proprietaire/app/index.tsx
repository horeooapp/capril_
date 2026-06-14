import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <Text className="text-3xl font-bold text-amber-600 mb-2">QAPRIL Propriétaire</Text>
      <Text className="text-lg text-gray-600">L'application full-native est prête !</Text>
      <StatusBar style="auto" />
    </View>
  );
}
