import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { auth, db } from './firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Ionicons } from '@expo/vector-icons'; 

export default function HomeScreen() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    const tasksList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTasks(tasksList);
  };

  const addTask = async () => {
    if (task.trim()) {
      await addDoc(collection(db, "tasks"), { task, user: auth.currentUser.email });
      setTask("");
      fetchTasks();
    }
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, "tasks", id));
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Task List</Text>

      <TextInput
        placeholder="Add a task"
        value={task}
        onChangeText={setTask}
        style={styles.input}
      />
      <TouchableOpacity style={styles.addButton} onPress={addTask}>
        <Text style={styles.addButtonText}>+ Add Task</Text>
      </TouchableOpacity>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <View style={styles.taskTextContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.taskText}>{item.task}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteButton}>
              <Ionicons name="trash-bin" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F8FF',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#5D5C61',
  },
  input: {
    borderWidth: 2,
    padding: 12,
    marginBottom: 15,
    borderRadius: 25,
    borderColor: '#5D5C61',
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#5D5C61',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  addButton: {
    backgroundColor: '#FFB6C1',
    padding: 12,
    borderRadius: 25,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#BEBEBE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  taskTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#5D5C61',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#FFEBEE',
    borderRadius: 20,
  },
});
