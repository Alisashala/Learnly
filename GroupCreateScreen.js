import React, { useState } from "react";
import { 
  View, 
  TextInput, 
  Button, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Modal,
  Clipboard 
} from "react-native";
import { auth, db } from './firebaseConfig';
import { collection, addDoc } from "firebase/firestore";

export default function GroupCreateScreen({ navigation }) {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [createdGroupId, setCreatedGroupId] = useState(null);
  const [isGroupCreated, setIsGroupCreated] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const createGroup = async () => {
    if (!groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }

    try {
      const groupRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        description: groupDescription,
        members: [auth.currentUser.email],
        createdBy: auth.currentUser.email,
        createdAt: new Date(),
      });

      // Store the created group ID and show modal
      setCreatedGroupId(groupRef.id);
      setIsGroupCreated(true);
    } catch (error) {
      console.error("Error creating group:", error.message);
      alert("Error creating group, please try again.");
    }
  };

  const handleCopyGroupId = () => {
    Clipboard.setString(createdGroupId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleJoinGroup = () => {
    // Navigate to GroupTasks with the new group ID
    navigation.navigate("GroupTasks", { groupId: createdGroupId });
    setIsGroupCreated(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Group</Text>
      <TextInput
        placeholder="Group Name"
        value={groupName}
        onChangeText={setGroupName}
        style={styles.input}
      />
      <TextInput
        placeholder="Group Description"
        value={groupDescription}
        onChangeText={setGroupDescription}
        style={styles.input}
        multiline={true}
      />
      <TouchableOpacity style={styles.createButton} onPress={createGroup}>
        <Text style={styles.createButtonText}>Create Group</Text>
      </TouchableOpacity>

      <Modal
        visible={isGroupCreated}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Group Created Successfully!</Text>
            <View style={styles.groupIdContainer}>
              <Text style={styles.groupIdLabel}>Group ID:</Text>
              <Text style={styles.groupIdText}>{createdGroupId}</Text>
              <TouchableOpacity 
                style={styles.copyButton} 
                onPress={handleCopyGroupId}
              >
                <Text style={styles.copyButtonText}>
                  {isCopied ? '✓ Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.instructionText}>
              Share this ID with others who want to join your group.
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.enterButton} 
                onPress={handleJoinGroup}
              >
                <Text style={styles.enterButtonText}>Enter Group</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F4F6F8",  // Light gray background
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
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
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
    marginBottom: 15,
  },
  groupIdLabel: {
    fontSize: 16,
    marginRight: 10,
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
