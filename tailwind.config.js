/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Montserrat
        montserrat: ["Montserrat_400Regular"],
        "montserrat-medium": ["Montserrat_500Medium"],
        "montserrat-semibold": ["Montserrat_600SemiBold"],
        "montserrat-bold": ["Montserrat_700Bold"],

        // Lato
        lato: ["Lato_400Regular"],
        "lato-light": ["Lato_300Light"],
        "lato-normal": ["Lato_400Normal"],
        "lato-medium": ["Lato_500Medium"],
        "lato-bold": ["Lato_700Bold"],
        "lato-black": ["Lato_900Black"],

        // Inter
        inter: ["Inter_400Regular"],
        "inter-semibold": ["Inter_600SemiBold"],

        // Lora
        lora: ["Lora_400Regular"],
        "lora-medium": ["Lora_500Medium"],
        "lora-semibold": ["Lora_600SemiBold"],
        "lora-bold": ["Lora_700Bold"],
      },
    },
  },
  plugins: [],
};
