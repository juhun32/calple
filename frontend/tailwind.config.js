module.exports = {
    darkMode: "class",
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [
        plugin(function ({ addVariant }) {
            // This adds the 'pink:' variant.
            // It will apply the utility when an ancestor has the '.pink' class.
            // e.g., pink:bg-background becomes .pink .bg-background { ... }
            addVariant("pink", ".pink &");
            addVariant("pinkdark", ".pink.dark &");
        }),
    ],
};
