import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./LoginScreen";
import GroupScreen from "./GroupScreen";
import GroupTasksScreen from "./GroupTasksScreen";
import GroupJoinScreen from "./GroupJoinScreen";
import GroupCreateScreen from "./GroupCreateScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={GroupScreen} />
        <Stack.Screen name="GroupTasks" component={GroupTasksScreen} />
        <Stack.Screen name="CreateGroupScreen" component={GroupCreateScreen} />
        <Stack.Screen name="JoinGroupScreen" component={GroupJoinScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}