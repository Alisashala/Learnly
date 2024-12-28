import React, { useEffect, useState, useLayoutEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; // For icons
import { auth, db } from './firebaseConfig';
import { collection, query, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import AntDesign from '@expo/vector-icons/AntDesign';

// Definerer komponenten GroupScreen og modtager navigation som en prop
export default function GroupScreen({ navigation }) {
  const [groups, setGroups] = useState([]); // State til at gemme listen af grupper, som brugeren er medlem af

  // Konfigurerer header-indstillingerne, når komponenten indlæses (log-ud knap)
  useLayoutEffect(() => {
    navigation.setOptions({  // Sætter navigationsindstillinger for headeren
      headerRight: () => (
         // Tilføjer en knap til højre i headeren
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout} // Kalder handleLogout, når knappen trykkes
          activeOpacity={0.7}  // Tilføjer en trykeffekt
        >
          <AntDesign name="logout" size={24} color="#FF3B30" />
          {/* Viser et logout-ikon i knappen */}
        </TouchableOpacity>
      ),
    });
  }, [navigation]); // useLayoutEffect kører, hver gang navigation ændrer sig, for at opdatere headeren

  // Funktion til at logge brugeren ud
  const handleLogout = () => {
    signOut(auth) // Kalder Firebase's signOut-metode for at logge brugeren ud
      .then(() => {
        navigation.replace("Login");
        // Efter logout navigerers brugeren til Login-skærmen
      })
      .catch((error) => {
        console.error("Logout failed: ", error.message);
        alert("Logout failed: " + error.message);
      });
  };

   // Funktion til at hente brugerens grupper fra Firestore
  useEffect(() => {
      const fetchGroups = async () => {
      const userEmail = auth.currentUser.email; // Henter den aktuelle brugers e-mail

      // Opretter en forespørgsel for at finde grupper, hvor brugeren er medlem
      const q = query(collection(db, "groups"), where("members", "array-contains", userEmail));
      const querySnapshot = await getDocs(q); // Udfører forespørgslen og får resultatet
      const userGroups = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
        // Mapper dokumenterne til et array af gruppeobjekter med id og data
      }));
      
      setGroups(userGroups); // Opdaterer state med de hentede grupper
    };

    fetchGroups();// Kalder fetchGroups, når komponenten indlæses
  }, []); // useEffect kører kun én gang, når komponenten indlæses


  // Definerer, hvordan en individuel gruppe vises i listen
  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => navigation.navigate("GroupTasks", { groupId: item.id })}
      // Navigerer til GroupTasks-skærmen med gruppe-ID'et som parameter
    >
      <Text style={styles.groupName}>{item.name}</Text>
      <Text style={styles.groupDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  // returnerer brugergrænseflade 
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Study Groups</Text>

{/* Kontrollerer, om der findes grupper i state */}
      {groups.length > 0 ? (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id} // unikt id
          renderItem={renderGroupItem}
          style={styles.groupList}
        />
      ) : (
        <Text style={styles.noGroupsText}>You are not part of any groups yet.</Text>
      )}

      {/* knap til at navigere til CreateGroupScreen */}
      <TouchableOpacity
        style={[styles.roundButton, { bottom: 120 }]} 
        onPress={() => navigation.navigate("CreateGroupScreen")}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* knap til at navigere til JoinGroupScreen */}
      <TouchableOpacity
        style={[styles.roundButton, { bottom: 50 }]} 
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
    backgroundColor: "#F4F6F8", 
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E88E5", 
    marginBottom: 20,
  },
  groupList: {
    width: "100%",
    marginBottom: 20,
  },
  groupItem: {
    backgroundColor: "#E3F2FD", 
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    width: "100%",
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E88E5", 
  },
  groupDescription: {
    fontSize: 14,
    color: "#5E6472", 
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
    backgroundColor: "#1976D2", 
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, 
    shadowColor: "#000", 
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  logoutButton: {
    marginRight: 20,
    padding: 4,
    bottom: 5,
    right: 10,
    borderRadius: 50,  
    backgroundColor: 'white', 
    shadowColor: '#000',
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2, 
  },
 
});
