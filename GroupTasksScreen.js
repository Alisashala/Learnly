import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  Modal,
  ScrollView 
} from "react-native";
import * as Clipboard from 'expo-clipboard';
import DateTimePicker from "@react-native-community/datetimepicker";
import { db, auth } from './firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from "firebase/firestore";

export default function GroupTasksScreen({ route, navigation }) {
  const { groupId } = route.params;
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [isMembersModalVisible, setIsMembersModalVisible] = useState(false);

  // Fetch group tasks and members when screen loads
  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const groupRef = doc(db, "groups", groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        
        // Parse tasks and convert Timestamp to Date
        const parsedTasks = (groupData.tasks || []).map((task) => ({
          ...task,
          deadline: task.deadline ? new Date(task.deadline.seconds * 1000) : null, // Convert Firestore Timestamp to Date
        }));
  
        setTasks(parsedTasks);
        setGroupMembers(groupData.members || []);
        setGroupName(groupData.name || "Group");
      }
    } catch (error) {
      console.error("Error fetching group data:", error);
      alert("Failed to fetch group information");
    }
  };
  
  const addTask = async () => {
    if (!newTask.trim()) {
      alert("Please enter a task");
      return;
    }

    const taskToAdd = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
      createdBy: auth.currentUser.email,
      createdAt: new Date(),
      deadline: deadline
    };

    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        tasks: arrayUnion(taskToAdd)
      });

      // Update local state
      setTasks(prevTasks => [...prevTasks, taskToAdd]);
      setNewTask("");
      setIsAddTaskModalVisible(false);
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task");
    }
  };

  const toggleTaskCompletion = async (taskToToggle) => {
    try {
      const groupRef = doc(db, "groups", groupId);
      
      // Remove the old task
      await updateDoc(groupRef, {
        tasks: arrayRemove(taskToToggle)
      });

      // Add the updated task
      const updatedTask = {
        ...taskToToggle,
        completed: !taskToToggle.completed
      };

      await updateDoc(groupRef, {
        tasks: arrayUnion(updatedTask)
      });

      // Update local state
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

  const onDeadlineChange = (event, selectedDate) => {
    const currentDate = selectedDate || deadline;
    setShowDatePicker(false);
    setDeadline(currentDate);
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{groupName}</Text>
        <TouchableOpacity
          style={styles.membersButton}
          onPress={() => setIsMembersModalVisible(true)}
        >
          <Text style={styles.membersButtonText}>👥</Text>
        </TouchableOpacity>
      </View>
  
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>No tasks yet. Add a task!</Text>
        }
      />
  
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddTaskModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Task</Text>
      </TouchableOpacity>
  
      <Modal
  visible={isMembersModalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setIsMembersModalVisible(false)}
>
  <View style={styles.modalContainer}>
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

      <Modal
        visible={isAddTaskModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TextInput
              style={styles.input}
              value={newTask}
              onChangeText={setNewTask}
              placeholder="Enter task description"
            />
            <TouchableOpacity
              style={styles.deadlineButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>Select Deadline: {deadline.toLocaleDateString()}</Text>
            </TouchableOpacity>
  
            {showDatePicker && (
              <DateTimePicker
                value={deadline}
                mode="date"
                display="default"
                onChange={onDeadlineChange}
              />
            )}
  
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={addTask}
              >
                <Text style={styles.modalButtonText}>Add Task</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsAddTaskModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
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
    backgroundColor: '#F0F4F8', // Light neutral background for modern look
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    
    top: 5,
    color: '#1976D2',  // Consistent blue color for titles
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1976D2',
  },
  input: {
    borderWidth: 1,
    borderColor: '#1976D2',
    padding: 14,
    borderRadius: 25,
    marginBottom: 20,
    fontSize: 16,
    color: '#444',
  },
  deadlineButton: {
    backgroundColor: '#E1F5FE',
    padding: 12,
    borderRadius: 25,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 25,
    marginRight: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#CCCCCC',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: 'white',
    fontSize: 16,
  },
  membersButton: {
    backgroundColor: 'white',  // Blue background to match your theme
    padding: 8,
    paddingBottom: 10,
    borderRadius: 50,           // Circular button
    position: 'absolute',
    right: 20,  
    bottom: 10,
    shadowColor: "#000",        // Add shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,              // Android shadow
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