import React, { useEffect, useState, useLayoutEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; // For icons
import { auth, db } from './firebaseConfig';
import { collection, query, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function GroupScreen({ navigation }) {
  const [groups, setGroups] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.7}  // Adds a nice press effect
        >
          <AntDesign name="logout" size={24} color="#FF3B30" />
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
        style={[styles.roundButton, { bottom: 120 }]} // Positioned one above the other
        onPress={() => navigation.navigate("CreateGroupScreen")}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Button to navigate to JoinGroupScreen */}
      <TouchableOpacity
        style={[styles.roundButton, { bottom: 50 }]} // Positioned below the Create button
        onPress={() => navigation.navigate("JoinGroupScreen")}
      >
        <Icon name="group" size={30} color="#fff" />
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
    backgroundColor: "#F4F6F8", // Consistent clean light gray background
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E88E5", // Blue header for consistency
    marginBottom: 20,
  },
  groupList: {
    width: "100%",
    marginBottom: 20,
  },
  groupItem: {
    backgroundColor: "#E3F2FD", // Light blue for group items
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    width: "100%",
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E88E5", // Strong blue for group names
  },
  groupDescription: {
    fontSize: 14,
    color: "#5E6472", // Subtle gray for descriptions
  },
  noGroupsText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  roundButton: {
    position: "absolute",
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1976D2", // Darker blue for buttons
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  logoutButton: {
    marginRight: 20,
    padding: 4,
    bottom: 5,
    right: 10,
    borderRadius: 50,  // Makes it circular
    backgroundColor: 'white',  // Light grey background
    shadowColor: '#000',
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,  // Android shadow
  },
 
});
