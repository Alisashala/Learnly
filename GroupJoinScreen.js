import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text } from "react-native";
import { db, auth } from './firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

export default function GroupJoinScreen({ navigation }) {
  const [groupId, setGroupId] = useState("");

  const joinGroup = async () => {
    if (!groupId.trim()) {
      alert("Please enter a valid group ID.");
      return;
    }

    try {
      const groupRef = doc(db, "groups", groupId);
      const groupDoc = await getDoc(groupRef);

      if (groupDoc.exists()) {
        await updateDoc(groupRef, {
          members: arrayUnion(auth.currentUser.email),
        });
        alert("You have successfully joined the group!");

        navigation.navigate("GroupTasks", { groupId });
      } else {
        alert("Group not found. Please check the ID and try again.");
      }
    } catch (error) {
      console.error("Error joining group:", error.message);
      alert("Error joining group, please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Group</Text>
      <TextInput
        placeholder="Enter Group ID"
        value={groupId}
        onChangeText={setGroupId}
        style={styles.input}
      />
      <TouchableOpacity style={styles.joinButton} onPress={joinGroup}>
        <Text style={styles.joinButtonText}>Join Group</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F4F6F8",  // Light gray background to match consistency
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E88E5",  // Consistent blue title color
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    borderRadius: 10,
    borderColor: "#E0E0E0",  // Light gray border
    borderWidth: 1,
    fontSize: 16,
  },
  joinButton: {
    backgroundColor: "#1976D2",
    padding: 10, // Reduced padding
    borderRadius: 20, // Reduced border radius
    alignItems: "center",
    marginBottom: 15, // Slightly reduced margin
    marginLeft: 70,
    marginRight: 70,
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
