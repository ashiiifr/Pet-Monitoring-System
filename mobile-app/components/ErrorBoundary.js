import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>System Malfunction</Text>
                    <Text style={styles.message}>{this.state.error?.toString()}</Text>
                    <TouchableOpacity
                        style={styles.btn}
                        onPress={() => this.setState({ hasError: false })}
                    >
                        <Text style={styles.btnText}>Reboot System</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        color: '#EF4444',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    message: {
        color: '#FFF',
        marginBottom: 20,
        textAlign: 'center',
    },
    btn: {
        padding: 15,
        backgroundColor: '#333',
        borderRadius: 8,
    },
    btnText: {
        color: '#FFF',
        fontWeight: 'bold',
    }
});
