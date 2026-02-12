export const theme = {
    colors: {
        primary: '#4F46E5', // Indigo 600
        primaryDark: '#4338CA', // Indigo 700
        primaryLight: '#818CF8', // Indigo 400
        secondary: '#EC4899', // Pink 500
        background: '#F9FAFB', // Gray 50
        surface: '#FFFFFF',
        text: {
            primary: '#111827', // Gray 900
            secondary: '#4B5563', // Gray 600
            light: '#9CA3AF', // Gray 400
            inverse: '#FFFFFF',
        },
        border: '#E5E7EB', // Gray 200
        success: '#10B981', // Emerald 500
        error: '#EF4444', // Red 500
        warning: '#F59E0B', // Amber 500
        info: '#3B82F6', // Blue 500
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        s: 8,
        m: 12,
        l: 16,
        xl: 24,
        round: 9999,
    },
    shadows: {
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
        },
    },
    typography: {
        h1: { fontSize: 32, fontWeight: '700', letterSpacing: -1 },
        h2: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
        h3: { fontSize: 20, fontWeight: '600' },
        body: { fontSize: 16, lineHeight: 24 },
        caption: { fontSize: 14, color: '#6B7280' },
        small: { fontSize: 12, color: '#9CA3AF' },
    }
};
