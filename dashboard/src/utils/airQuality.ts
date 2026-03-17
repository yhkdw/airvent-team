export type AirStatus = 'best' | 'good' | 'warn' | 'bad';

export const getMetricStatus = (key: string, val: number): AirStatus => {
    switch (key) {
        case 'pm10':
            if (val <= 30) return 'best';
            if (val <= 80) return 'good';
            if (val <= 150) return 'warn';
            return 'bad';
        case 'pm25':
            if (val <= 15) return 'best';
            if (val <= 35) return 'good';
            if (val <= 75) return 'warn';
            return 'bad';
        case 'pm1':
            if (val <= 10) return 'best';
            if (val <= 20) return 'good';
            if (val <= 35) return 'warn';
            return 'bad';
        case 'voc': // TVOC Level (0-100)
            if (val <= 10) return 'best';
            if (val <= 25) return 'good';
            if (val <= 50) return 'warn';
            return 'bad';
        case 'temp': // Temperature
            if (val >= 20 && val <= 24) return 'best';
            if ((val >= 18 && val < 20) || (val > 24 && val <= 26)) return 'good';
            if ((val >= 16 && val < 18) || (val > 26 && val <= 28)) return 'warn';
            return 'bad';
        case 'hum': // Humidity
            if (val >= 40 && val <= 60) return 'best';
            if ((val >= 30 && val < 40) || (val > 60 && val <= 70)) return 'good';
            if ((val >= 20 && val < 30) || (val > 70 && val <= 80)) return 'warn';
            return 'bad';
        case 'co2': // Default
            if (val <= 600) return 'best';
            if (val <= 1000) return 'good';
            if (val <= 1500) return 'warn';
            return 'bad';
        default:
            return 'good';
    }
};

export const getWorstStatus = (statuses: AirStatus[]): AirStatus => {
    const order: AirStatus[] = ['bad', 'warn', 'good', 'best'];
    for (const s of order) {
        if (statuses.includes(s)) return s;
    }
    return 'good';
};
