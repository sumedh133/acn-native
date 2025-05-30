import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import { legalContent } from "./legalContent";

type LegalRouteProp = RouteProp<{
  Legal: {
    id?: string;
  };
}>;

const Legal = () => {
  const route = useRoute<LegalRouteProp>();
  const id = route.params?.id || "tnc";
  const [markdownContent, setMarkdownContent] = useState("");

  // Handle different URL types
  const handleLinkPress = async (url: string) => {
    if (!url || !url.trim()) return;

    const trimmedUrl = url.trim();

    try {
      // Handle mailto links specially
      if (trimmedUrl.startsWith("mailto:")) {
        const email = trimmedUrl.replace("mailto:", "");
        // Try standard mailto
        const canOpen = await Linking.canOpenURL(`mailto:${email}`);
        if (canOpen) {
          await Linking.openURL(`mailto:${email}`);
        } else {
          // Fallback: Just show the email address
          Alert.alert("Contact Us", `Please send an email to:\n\n${email}`, [
            { text: "OK" },
          ]);
        }
        return;
      }

      // Handle phone links
      if (trimmedUrl.startsWith("tel:")) {
        const canOpen = await Linking.canOpenURL(trimmedUrl);
        if (canOpen) {
          await Linking.openURL(trimmedUrl);
        } else {
          const phoneNumber = trimmedUrl.replace("tel:", "");
          Alert.alert("Call", `Phone: ${phoneNumber}`, [{ text: "OK" }]);
        }
        return;
      }

      // Handle regular URLs (http/https)
      const canOpen = await Linking.canOpenURL(trimmedUrl);
      if (canOpen) {
        await Linking.openURL(trimmedUrl);
      } else {
        Alert.alert("Unable to open link", `Cannot open: ${trimmedUrl}`, [
          { text: "OK" },
        ]);
      }
    } catch (err) {
      console.error("Failed to open URL:", url, err);
      Alert.alert("Error", "Failed to open the link.", [{ text: "OK" }]);
    }
  };

  useEffect(() => {
    const content = legalContent[id];
    if (content) {
      setMarkdownContent(content);
    } else {
      setMarkdownContent("Content not found.");
    }
  }, [id]);

  // Simple markdown parser for React Native
  const parseMarkdown = (markdown: string) => {
    if (!markdown) return null;

    const lines = markdown.split("\n");
    const elements: JSX.Element[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip empty lines
      if (!line.trim()) {
        elements.push(<View key={key++} style={styles.spacing} />);
        continue;
      }

      // Headers
      if (line.startsWith("# ")) {
        elements.push(
          <Text key={key++} style={styles.h1}>
            {parseInlineMarkdown(line.substring(2))}
          </Text>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <Text key={key++} style={styles.h2}>
            {parseInlineMarkdown(line.substring(3))}
          </Text>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <Text key={key++} style={styles.h3}>
            {parseInlineMarkdown(line.substring(4))}
          </Text>
        );
      }
      // List items
      else if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(
          <View key={key++} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>
              {parseInlineMarkdown(line.substring(2))}
            </Text>
          </View>
        );
      }
      // Regular paragraphs
      else {
        elements.push(
          <Text key={key++} style={styles.paragraph}>
            {parseInlineMarkdown(line)}
          </Text>
        );
      }
    }

    return elements;
  };

  // Handle inline markdown like links, bold, etc.
  const parseInlineMarkdown = (text: string): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    let key = 0;

    // Check if text is valid
    if (!text || typeof text !== "string") {
      return [<Text key={0}>{text || ""}</Text>];
    }

    // Combined regex for links and bold text
    const combinedRegex = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)/g;
    let lastIndex = 0;
    let match;

    try {
      while ((match = combinedRegex.exec(text)) !== null) {
        // Add text before current match
        if (match.index > lastIndex) {
          const beforeText = text.substring(lastIndex, match.index);
          if (beforeText) {
            elements.push(<Text key={key++}>{beforeText}</Text>);
          }
        }

        // Check if it's a link match [text](url)
        if (match[1]) {
          const linkText = match[2];
          const url = match[3];

          if (linkText && url) {
            elements.push(
              <Text
                key={key++}
                style={styles.link}
                onPress={() => handleLinkPress(url)}
              >
                {linkText}
              </Text>
            );
          }
        }
        // Check if it's a bold match **text**
        else if (match[4]) {
          const boldText = match[5];

          if (boldText) {
            elements.push(
              <Text key={key++} style={styles.bold}>
                {boldText}
              </Text>
            );
          }
        }

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        const remainingText = text.substring(lastIndex);
        if (remainingText) {
          elements.push(<Text key={key++}>{remainingText}</Text>);
        }
      }
    } catch (error) {
      console.error("Error parsing inline markdown:", error);
      return [<Text key={0}>{text}</Text>];
    }

    return elements.length > 0 ? elements : [<Text key={0}>{text}</Text>];
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.content}>{parseMarkdown(markdownContent)}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    paddingBottom: 32,
  },
  content: {
    maxWidth: 1344, // equivalent to max-w-[84rem]
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 0, // equivalent to mt-12
  },
  h1: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    fontFamily: "Montserrat", // Make sure you have this font loaded
    textAlign: "center",
  },
  h2: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 32,
    fontFamily: "Montserrat",
    textAlign: "left",
  },
  h3: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    fontFamily: "Montserrat",
    textAlign: "left",
  },
  paragraph: {
    textAlign: "left",
    fontSize: 16,
    color: "#6B7280", // equivalent to text-gray-500
    marginBottom: 12,
    fontFamily: "Lato",
    lineHeight: 24,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 28, // equivalent to pl-7
  },
  bullet: {
    color: "#6B7280",
    marginRight: 8,
    fontFamily: "Lato",
  },
  listText: {
    flex: 1,
    textAlign: "left",
    color: "#6B7280",
    fontFamily: "Lato",
    fontSize: 16,
    lineHeight: 24,
  },
  link: {
    color: "#3B82F6", // equivalent to text-blue-500
    textDecorationLine: "underline",
    fontFamily: "Lato",
  },
  bold: {
    color: "#0F0F0F",
    fontWeight: "bold",
    fontFamily: "Lato",
  },
  spacing: {
    height: 8,
  },
});

export default Legal;
