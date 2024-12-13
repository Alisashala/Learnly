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
import DateTimePicker from "@react-native-community/datetimepicker";
import { db, auth } from './firebaseConfig';
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
        setTasks(groupData.tasks || []);
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
          <Text style={styles.membersButtonText}>👥 Members</Text>
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

      {/* Members Modal */}
      <Modal
        visible={isMembersModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsMembersModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.membersModalContent}>
            <Text style={styles.membersModalTitle}>Group Members</Text>
            <ScrollView>
              {groupMembers.map((member, index) => (
                <View key={index} style={styles.memberItem}>
                  <Text style={styles.memberText}>👤 {member}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setIsMembersModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
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
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TextInput
              style={styles.input}
              value={newTask}
              onChangeText={setNewTask}
              placeholder="Enter task description"
            />
            
            {/* Deadline selection */}
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
    right: 70,
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
    backgroundColor: '#CCCCCC', // Light gray color
    paddingVertical: 10,       // Vertical padding
    paddingHorizontal: 15,     // Horizontal padding
    borderRadius: 8,           // Rounded corners
    position: 'absolute',
    right: 20,                 // Positioned to the right
  },
  membersButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
    marginBottom: 20,
  },
  memberItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  memberText: {
    fontSize: 18,
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
