import React, { useEffect, useState, useLayoutEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { auth, db } from './firebaseConfig';
import { collection, query, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function GroupScreen({ navigation }) {
  const [groups, setGroups] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => {
        console.error("Logout failed: ", error.message);
        alert("Logout failed: " + error.message);
      });
  };

  useEffect(() => {
    const fetchGroups = async () => {
      const userEmail = auth.currentUser.email;

      // Query to fetch the groups where the current user is a member
      const q = query(collection(db, "groups"), where("members", "array-contains", userEmail));
      const querySnapshot = await getDocs(q);
      const userGroups = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setGroups(userGroups);
    };

    fetchGroups();
  }, []);

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => navigation.navigate("GroupTasks", { groupId: item.id })}
    >
      <Text style={styles.groupName}>{item.name}</Text>
      <Text style={styles.groupDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Study Groups</Text>

      {groups.length > 0 ? (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={renderGroupItem}
          style={styles.groupList}
        />
      ) : (
        <Text style={styles.noGroupsText}>You are not part of any groups yet.</Text>
      )}

      {/* Button to navigate to CreateGroupScreen */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CreateGroupScreen")}
      >
        <Text style={styles.buttonText}>Create a New Group</Text>
      </TouchableOpacity>

      {/* Button to navigate to JoinGroupScreen */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("JoinGroupScreen")}
      >
        <Text style={styles.buttonText}>Join an Existing Group</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F4F6F8",  // Consistent clean light gray background
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E88E5",  // Blue header for consistency
    marginBottom: 20,
  },
  groupList: {
    width: "100%",
    marginBottom: 20,
  },
  groupItem: {
    backgroundColor: "#E3F2FD",  // Light blue for group items
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    width: "100%",
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E88E5",  // Strong blue for group names
  },
  groupDescription: {
    fontSize: 14,
    color: "#5E6472",  // Subtle gray for descriptions
  },
  noGroupsText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#1976D2",  // Darker blue for action buttons
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    marginRight: 15,
  },
  logoutText: {
    color: "#FF6347",  // Keeping logout red for clarity
    fontSize: 16,
    fontWeight: "bold",
  },
});
