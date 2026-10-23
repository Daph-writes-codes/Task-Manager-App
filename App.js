import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@TaskManager_tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load tasks');
    }
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
      Alert.alert('Error', 'Failed to save tasks');
    }
  };

  const addTask = () => {
    if (inputText.trim() === '') {
      Alert.alert('Oops', 'Please enter a task');
      return;
    }
    const newTask = {
    id: Date.now().toString(),
    text: inputText.trim(),
    completed: false,
  };

  const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setInputText('');
  };
  
  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };  

  const toggleComplete = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const updateTask = () => {
    if (editText.trim() === '') {
      Alert.alert('Oops', 'Task text cannot be empty');
      return;
    }
    const updatedTasks = tasks.map((task) =>
      task.id === editingTask.id ? { ...task, text: editText.trim() } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setEditModalVisible(false);
    setEditingTask(null);
    setEditText('');
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'active':
        return tasks.filter((task) => !task.completed);
      case 'completed':
        return tasks.filter((task) => task.completed);
      default:
        return tasks;
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditText(task.text);
    setEditModalVisible(true);
  };

  const renderTask = ({ item }) => (
  <View style={styles.taskItem}>
    <Pressable style={{ flex: 1 }} onPress={() => toggleComplete(item.id)}>
      <Text
        style={[
          styles.taskText,
          item.completed && {
            textDecorationLine: 'line-through',
            color: '#999',
          },
        ]}
      >
        {item.text}
      </Text>
    </Pressable>
    <View style={styles.taskButtons}>
      <Pressable style={styles.editButton} onPress={() => openEditModal(item)}>
        <Text style={styles.buttonText}>Edit</Text>
      </Pressable>
      <Pressable style={styles.deleteButton} onPress={() => deleteTask(item.id)}>
        <Text style={styles.buttonText}>Delete</Text>
      </Pressable>
    </View>
  </View>
);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Manager</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          value={inputText}
          onChangeText={setInputText}
        />
        <Pressable style={styles.addButton} onPress={addTask}>
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            Active
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Completed
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={getFilteredTasks()}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks yet. Add one above!</Text>
        }
      />

      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput
              style={styles.modalInput}
              value={editText}
              onChangeText={setEditText}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.saveButton} onPress={updateTask}>
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
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
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    backgroundColor: '#4a90d9',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#4a90d9',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
    taskItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
        // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
        // Elevation for Android
    elevation: 2,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  taskButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#888',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteButton: {
    backgroundColor: '#d94a4a',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    width: '85%',
        // Stronger shadow for the modal card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },    
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4a90d9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#888',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
});