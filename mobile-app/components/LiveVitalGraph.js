import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function LiveVitalGraph({ data, color = '255, 99, 132' }) {
    const screenWidth = Dimensions.get('window').width;

    const chartConfig = {
        backgroundGradientFrom: '#1e293b',
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: '#1e293b',
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => `rgba(${color}, ${opacity})`,
        strokeWidth: 3, // optional, default 3
        barPercentage: 0.5,
        useShadowColorFromDataset: false, // optional
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#fff"
        }
    };

    // Ensure we have enough data points to render
    const chartData = {
        labels: [], // Hide labels for clean look
        datasets: [
            {
                data: data.length > 0 ? data : [0, 0, 0, 0, 0],
                color: (opacity = 1) => `rgba(${color}, ${opacity})`,
                strokeWidth: 3
            }
        ]
    };

    return (
        <View style={styles.container}>
            <LineChart
                data={chartData}
                width={screenWidth - 48}
                height={180}
                chartConfig={chartConfig}
                bezier
                withDots={false}
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLabels={false}
                withHorizontalLabels={true}
                yAxisInterval={1}
                style={{
                    borderRadius: 16,
                    paddingRight: 0,
                    marginLeft: -20 // Hack to remove left padding
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 180,
    }
});
