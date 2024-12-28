import React, { useState } from "react";
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Modal} from "react-native";
import * as Clipboard from 'expo-clipboard';
import { auth, db } from './firebaseConfig';
import { collection, addDoc } from "firebase/firestore";

// Hovedkomponent til oprettelse af grupper
//tager navigation som prop = så kan vi bruge den i andre dele af appen
export default function GroupCreateScreen({ navigation }) {
  // State til at håndtere brugerinput og app-adfærd
  const [groupName, setGroupName] = useState(""); // Inputfelt til gruppenavn
  const [groupDescription, setGroupDescription] = useState(""); // Inputfelt til gruppebeskrivelse
  const [createdGroupId, setCreatedGroupId] = useState(null); // Gemmer ID'et for den oprettede gruppe
  const [isGroupCreated, setIsGroupCreated] = useState(false); // Styrer synligheden af modalvinduet
  const [isCopied, setIsCopied] = useState(false); // Holder styr på om gruppe-ID'et er kopieret

  // Funktion til at oprette en gruppe
  const createGroup = async () => {
    if (!groupName.trim()) {
      // Tjekker om gruppenavnet er tomt
      alert("Indtast venligst et gruppenavn.");
      return;
    }
    try {
      // Tilføjer gruppen til Firestore
      // tilføjes til 'groups' til firebase
      // await = sikrer, at funktionen venter, indtil dokumentet er oprettet
      const groupRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        description: groupDescription,
        members: [auth.currentUser.email], // Tilføjer den aktuelle bruger som medlem
        createdBy: auth.currentUser.email, // Angiver den aktuelle bruger som skaber
        createdAt: new Date(), // Tidsstempel for oprettelse
      });

      // Gem det oprettede gruppe-ID og vis modal
      // 
      setCreatedGroupId(groupRef.id); // Gemmer gruppe-ID
      setIsGroupCreated(true); // Viser succes-modal
    } catch (error) {
      // Logger fejl og viser en fejlbesked til brugeren
      console.error("Fejl under oprettelse af gruppe:", error.message);
      alert("Fejl under oprettelse af gruppe. Prøv igen.");
    }
  };

  // Funktion til at kopiere gruppe-ID'et til udklipsholderen
  const handleCopyGroupId = () => {
    Clipboard.setString(createdGroupId); // Kopierer gruppe-ID'et
    setIsCopied(true); // Viser feedback om at ID'et er kopieret
    setTimeout(() => setIsCopied(false), 2000); // Nulstiller feedback efter 2 sekunder
  };

  // Funktion til at navigere til gruppens opgaveskærm
  const handleJoinGroup = () => {
    navigation.navigate("GroupTasks", { groupId: createdGroupId }); // Sender gruppe-ID som parameter
    setIsGroupCreated(false); // Lukker modal
  };

  // Returnerer brugergrænsefladen
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Group</Text>
      {/* Inputfelt til gruppenavn */}
      <TextInput
        placeholder="Group Name"
        value={groupName}
        onChangeText={setGroupName}
        style={styles.input}
      />
      {/* Inputfelt til gruppebeskrivelse */}
      <TextInput
        placeholder="Group Description"
        value={groupDescription}
        onChangeText={setGroupDescription}
        style={styles.input}
        multiline={true}
      />
      {/* Knap til at oprette en gruppe */}
      <TouchableOpacity style={styles.createButton} onPress={createGroup}>
        <Text style={styles.createButtonText}>Create Group</Text>
      </TouchableOpacity>

      {/* Modal der viser, når gruppen er oprettet */}
      <Modal
        visible={isGroupCreated}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Group Has Been Created!</Text>
            <View style={styles.groupIdContainer}>
              <Text style={styles.groupIdText}>{createdGroupId}</Text>
              {/* Knap til at kopiere gruppe-ID */}
              <TouchableOpacity 
                style={styles.copyButton} 
                onPress={handleCopyGroupId}
              >
                <Text style={styles.copyButtonText}>
                  {isCopied ? '✓ Kopieret' : 'Kopier'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.instructionText}>
            Share this ID with others who want to join the group.
            </Text>
            
            {/* Knapper i modalvinduet */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.enterButton} 
                onPress={handleJoinGroup}
              >
                <Text style={styles.enterButtonText}>Go To The Group</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setIsGroupCreated(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 15,
    borderRadius: 10,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: "#1976D2",
    padding: 10, 
    borderRadius: 20, 
    alignItems: "center",
    marginBottom: 15,
    marginLeft: 70,
    marginRight: 70,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  groupIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
  },
  
  groupIdText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976D2",
    marginRight: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  copyButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  copyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  instructionText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  enterButton: {
    backgroundColor: "#1976D2",
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  enterButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 5,
    flex: 1,
  },
  closeButtonText: {
    color: "#333",
    textAlign: "center",
    fontWeight: "bold",
  },
});
