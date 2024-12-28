import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from "react-native";
import { db, auth } from './firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

//implementerer en skærm, der tillader en bruger at joine sig en eksisterende gruppe i en applikation
export default function GroupJoinScreen({ navigation }) {
  const [groupId, setGroupId] = useState(""); // State til at gemme det indtastede gruppe-ID

  // Funktion til at joine en gruppe
  const joinGroup = async () => {
    // Tjekker, om gruppe-ID'et er tomt
    if (!groupId.trim()) {
      alert("Please enter a valid group ID.");
      return;
    }

    try {
      // Reference til gruppedokumentet i Firestore
      const groupRef = doc(db, "groups", groupId);
      const groupDoc = await getDoc(groupRef); // Henter gruppens data

      if (groupDoc.exists()) {
         // Tilføjer den aktuelle bruger til gruppens medlemmer
        await updateDoc(groupRef, {
          members: arrayUnion(auth.currentUser.email), // Tilføjer brugeren uden at duplikere
        });
        alert("You have successfully joined the group!");

        // Navigerer til GroupTasks-skærmen med gruppe-ID'et
        navigation.navigate("GroupTasks", { groupId });
      } else {
        alert("Group not found. Please check the ID and try again.");
      }
    } catch (error) {
      console.error("Error joining group:", error.message);
      alert("Error joining group, please try again.");
    }
  };

  // returnerer brugergrænsefladen
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

//CSS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F4F6F8",  
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E88E5", 
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
    borderColor: "#E0E0E0",  
    borderWidth: 1,
    fontSize: 16,
  },
  joinButton: {
    backgroundColor: "#1976D2",
    padding: 10, 
    borderRadius: 20, 
    alignItems: "center",
    marginBottom: 15, 
    marginLeft: 70,
    marginRight: 70,
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
