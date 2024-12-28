import React, { useState, useEffect } from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal,ScrollView } from "react-native";
import * as Clipboard from 'expo-clipboard';
import { Keyboard } from 'react-native';
import DateTimePicker from "@react-native-community/datetimepicker";
import { db, auth } from './firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove} from "firebase/firestore";

// Eksporterer standardfunktionen GroupTasksScreen, der repræsenterer en skærm til håndtering af gruppeopgaver
export default function GroupTasksScreen({ route }) {
  const { groupId } = route.params;  // Henter 'groupId' fra route.params, som sendes fra en tidligere skærm via navigation.navigate
  const [tasks, setTasks] = useState([]);   // State til at gemme listen af opgaver for gruppen
  const [newTask, setNewTask] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [isMembersModalVisible, setIsMembersModalVisible] = useState(false);

 // useEffect Hook til at hente data om gruppen, når skærmen indlæses eller groupId ændres
  useEffect(() => {
    fetchGroupData(); // Kalder `fetchGroupData` for at hente data om gruppen fra Firestore
  }, [groupId]); // Afhængigheds-array: Kører kun, når `groupId` ændrer sig

  // Funktion til at hente gruppens data fra Firestore
  const fetchGroupData = async () => {
    // potentielle fejl (try)
    try {
      const groupRef = doc(db, "groups", groupId); // Opretter en reference til dokumentet
      const groupDoc = await getDoc(groupRef); // henter dokumentet fra Firestore
      
      //findes dokumentet i firestore?
      if (groupDoc.exists()) {
        const groupData = groupDoc.data(); // Henter data fra dokumentet
        

        //Tager en liste af opgaver fra Firestore, Hvis groupData.tasks ikke findes 
        //(f.eks. hvis der ikke er nogen opgaver endnu), bruges en tom liste [] i stedet.
        const parsedTasks = (groupData.tasks || []).map((task) => ({
          ...task, //Kopierer alle de eksisterende oplysninger om opgaven (f.eks. navn, status).
          deadline: task.deadline ? new Date(task.deadline.seconds * 1000) : null, //Hvis opgaven har en deadline, bliver den konverteret.
                                                                                   //Hvis der ikke er en deadline, sættes værdien til null.
        }));
  
        // Opdaterer de nye værdier
        setTasks(parsedTasks);
        setGroupMembers(groupData.members || []);
        setGroupName(groupData.name || "Group");
      }
    } catch (error) {
      console.error("Error fetching group data:", error);
      alert("Failed to fetch group information");
    }
  };
  

  // Funktion til at oprette en task
  const addTask = async () => {
    if (!newTask.trim()) { //tjekker om man har givet den et navn
      alert("Please enter a task");
      return;
    }

    // Variable: Værdier på de nye tasks man tilføjer/har tilføjet (kan ses på firebase)
    const taskToAdd = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
      createdBy: auth.currentUser.email,
      createdAt: new Date(),
      deadline: deadline
    };

    //try blok, potentielle fejl 
    // tilføjer en ny opgave til en eksisterende gruppe i Firestore.
    //Gruppen er identificeret ved groupId.
    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        tasks: arrayUnion(taskToAdd) //tilføjer til tasktoadd. Arrayunion = sikrer, at der ikke tilføjes duplikerede værdier
      });

      // opdaterer den nye task, og hvis der ikke er fejl, tilføjes den til listen
      setTasks(prevTasks => [...prevTasks, taskToAdd]);
      setNewTask("");
      setIsAddTaskModalVisible(false);
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task");
    }
  };

  //Denne funktion opdaterer en opgave i Firestore og komponentens state ved at ændre dens completed-status
  const toggleTaskCompletion = async (taskToToggle) => {
    try {
      const groupRef = doc(db, "groups", groupId); // Henter dokumentet for gruppen
      
      // Fjerner den gamle opgave
      await updateDoc(groupRef, {
        tasks: arrayRemove(taskToToggle)
      });

      // Opretter den opdaterede opgave
      const updatedTask = {
        ...taskToToggle,
        completed: !taskToToggle.completed
      };

      // Tilføj den opdaterede opgave til task-listen
      await updateDoc(groupRef, {
        tasks: arrayUnion(updatedTask)
      });

      // Tilføjer den opdaterede opgave tilbage til tasks-listen i Firestore
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskToToggle.id 
            ? { ...task, completed: !task.completed } 
            : task
        )
      );
    } catch (error) {
      console.error("Error toggling task:", error);
      alert("Failed to update task");
    }
  };

  // onDeadlineChange håndterer ændringer, når brugeren vælger en deadline via en datovælger (f.eks. DateTimePicker)
  const onDeadlineChange = (event, selectedDate) => {
    const currentDate = selectedDate || deadline;
    setShowDatePicker(false);
    setDeadline(currentDate);
  };

  // RenderTask bruges til at definere, hvordan en enkelt opgave (item) vises i brugergrænsefladen.
  const renderTask = ({ item }) => (
    <View style={styles.taskContainer}>
      <TouchableOpacity 
        style={styles.taskCheckbox}
        onPress={() => toggleTaskCompletion(item)}
      >
        <View style={[styles.checkbox, item.completed ? styles.checkboxCompleted : styles.checkboxUncompleted]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
      <View style={styles.taskTextContainer}>
        <Text style={[styles.taskText, item.completed && styles.completedTaskText]}>
          {item.text}
        </Text>
        <Text style={styles.deadlineText}>
          Deadline: {new Date(item.deadline).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  // Returnerer brugergrænsefladen
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{groupName}</Text>
        <TouchableOpacity
          style={styles.membersButton}
          onPress={() => setIsMembersModalVisible(true)}
        >
          <Text style={styles.membersButtonText}>👥</Text>
        </TouchableOpacity>
      </View>
  
      {/* Task List */}
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>No tasks yet. Add a task!</Text>
        }
      />
  
      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddTaskModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Task</Text>
      </TouchableOpacity>
  
      {/* Members Modal */}
      <Modal
        visible={isMembersModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsMembersModalVisible(false)}
      >
        <View style={styles.modalContainerMember}>
          <View style={styles.membersModalContent}>
            <Text style={styles.membersModalTitle}>Group ID</Text>
            <View style={styles.groupIdContainer}>
              <Text style={styles.groupIdText}>{groupId}</Text>
              <TouchableOpacity
                style={styles.copyIcon}
                onPress={() => {
                  Clipboard.setStringAsync(groupId);
                  alert("Group ID copied to clipboard!");
                }}
              >
                <Ionicons name="copy-outline" size={24} color="#1976D2" />
              </TouchableOpacity>
            </View>
  
            <ScrollView>
              <Text style={styles.groupmembersModalTitle}>Group Members</Text>
              {groupMembers.map((member, index) => (
                <View key={index} style={styles.memberItem}>
                  <Text style={styles.memberText}>👤 {member}</Text>
                </View>
              ))}
            </ScrollView>
  
            <TouchableOpacity
              style={styles.xButton}
              onPress={() => setIsMembersModalVisible(false)}
            >
              <Text style={styles.xButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  
      {/* Add Task Modal */}
      <Modal
        visible={isAddTaskModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsAddTaskModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>×</Text>
            </TouchableOpacity>
  
            <Text style={styles.modalTitle}>Create New Task</Text>
  
            {/* Task Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Task Description</Text>
              <TextInput
                style={styles.taskInput}
                value={newTask}
                onChangeText={setNewTask}
                placeholder="What needs to be done?"
                placeholderTextColor="#A0A0A0"
                multiline={true}
                maxLength={100}
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>
  
            {/* Deadline Picker */}
            <View style={styles.deadlineContainer}>
              <Text style={styles.inputLabel}>Deadline</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={24} color="#1976D2" style={styles.calendarIcon} />
                <Text style={styles.dateText}>
                  {deadline.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
            </View>
  
            {showDatePicker && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={deadline}
                  mode="date"
                  display="inline"
                  onChange={onDeadlineChange}
                  minimumDate={new Date()}
                  style={styles.datePicker}
                  color="white"
                />
              </View>
            )}
  
            {/* Create Task Button */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, !newTask.trim() && styles.modalButtonDisabled]}
                onPress={addTask}
                disabled={!newTask.trim()}
              >
                <Text style={styles.modalButtonText}>Create Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}  

// CSS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8', 
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    
    top: 5,
    color: '#1976D2',  
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  taskTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  taskCheckbox: {
    marginRight: 18,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderWidth: 3,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUncompleted: {
    borderColor: '#1976D2',
  },
  checkboxCompleted: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  checkmark: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskText: {
    fontSize: 16,
    color: '#444',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#bbb',
  },
  deadlineText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  emptyListText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalContainerMember: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 25, 
    padding: 24,
    width: '90%', 
    maxHeight: '100%', 
  },
  modalCloseButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
    padding: 5,
  },
  modalCloseButtonText: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 24,
    marginTop: 10,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  taskInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F8F9FA',
    minHeight: 50,
    textAlignVertical: 'top',
  },
  deadlineContainer: {
    marginBottom: 20,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  calendarIcon: {
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    color: 'black',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    
  },
  datePicker: {
    backgroundColor: 'white',
    height: 300,
    color: 'white',
  },
  modalButtonContainer: {
    marginTop: 10,
  },
  modalButton: {
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  modalButtonDisabled: {
    backgroundColor: '#B0BEC5',
    shadowOpacity: 0,
    elevation: 0,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  membersButton: {
    backgroundColor: 'white',  
    padding: 8,
    paddingBottom: 10,
    borderRadius: 50,           
    position: 'absolute',
    right: 20,  
    bottom: 10,
    shadowColor: "#000",        
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,              
  },
  membersButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,
  },
  membersModalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  membersModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  
  memberText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2C3E50',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 0.1,
    elevation: 2,
    
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  xButton: {
    position: 'absolute',
    right: 15,
    top: 10,
    zIndex: 1,
    padding: 3,
  },
  xButtonText: {
    color: '#A9A9A9',
    fontSize: 28,
    fontWeight: 'bold',
  },

  groupIdText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    backgroundColor: '#E3F2FD',
    padding: 15,
    marginVertical: 15,
    textAlign: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#1976D2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },

  groupIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  groupIdText: {
    fontSize: 16,
    marginRight: 10,
  },

  copyIcon: {
    padding: 8,
  },

  groupmembersModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  }


});