import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigation.replace("Home");
      })
      .catch((error) => {
        console.error("Login Error Code:", error.code);
        console.error("Login Error Message:", error.message);

        if (error.code === 'auth/user-not-found') {
          alert("User not found. Please check the email address.");
        } else if (error.code === 'auth/wrong-password') {
          alert("Incorrect password. Please try again.");
        } else {
          alert("Login failed: " + error.message);
        }
      });
  };

  const handleSignUp = () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("User created successfully! You can now log in.");
      })
      .catch((error) => {
        console.error("Sign Up Error Code:", error.code);
        console.error("Sign Up Error Message:", error.message);
        alert("Sign Up failed: " + error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Image source={require('./assets/Learnly.png')} style={styles.logo} />

      <Text style={styles.header}>Simplify Study Collaboration</Text>
      

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#AAB6C1"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#AAB6C1"
      />

<View style={styles.buttonContainer}>
  <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
    <Text style={{ color: "white" }}>Login</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
    <Text style={{ color: "white" }}>Sign Up</Text>
  </TouchableOpacity>
</View>
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
  logo: {
    width: 250, 
    height: 250, 
    marginBottom: 20, 
  },
  header: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#0c334a",
    marginBottom: 10,
  },

  input: {
    width: "100%",
    padding: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#90CAF9",
    backgroundColor: "#fff",
    color: "#333",
  },
  
buttonContainer: {
  flexDirection: "row", 
  justifyContent: "space-between", 
  alignItems: "center", 
  marginVertical: 10, 
},

loginButton: {
  width: "30%",
  backgroundColor: "#1E88E5",
  padding: 12,
  borderRadius: 8,
  alignItems: "center",
  marginRight: 10, 
},
signupButton: {
  width: "30%",
  backgroundColor: "#42A5F5",
  padding: 12,
  borderRadius: 8,
  alignItems: "center",
},

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

});
