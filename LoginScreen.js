import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
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
      <Text style={styles.header}>Welcome to Learnly</Text>
      <Text style={styles.subheader}>Simplify your study life with organized plans and collaboration tools.</Text>

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

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
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
    backgroundColor: "#F4F6F8", // Light gray background for a clean look
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E88E5", // Strong blue for the header
    marginBottom: 10,
  },
  subheader: {
    fontSize: 14,
    color: "#5E6472",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  input: {
    width: "100%",
    padding: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#90CAF9", // Soft blue for input borders
    backgroundColor: "#fff",
    color: "#333",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#1E88E5", // Professional blue for the login button
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  signupButton: {
    width: "100%",
    backgroundColor: "#42A5F5", // Lighter blue for the sign-up button
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
