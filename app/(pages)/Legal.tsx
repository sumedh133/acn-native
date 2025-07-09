import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useState, useRef } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Linking,
  Alert,
  NativeSyntheticEvent,
  LayoutChangeEvent,
} from "react-native";
import { legalContent } from "./legalContent";
import { useRouter } from "expo-router";

type LegalRouteProp = RouteProp<
  {
    Legal: {
      id?: string;
    };
  },
  "Legal"
>;

const Legal = () => {
  const router = useRouter();
  const route = useRoute<LegalRouteProp>();
  const id = route.params?.id || "tnc";
  const [markdownContent, setMarkdownContent] = useState<string>("");

  // Reference to ScrollView, to perform scrollTo calls
  const scrollRef = useRef<ScrollView>(null);

  // Store y-offset positions of all headings by slug
  const [headingPositions, setHeadingPositions] = useState<
    Record<string, number>
  >({});

  // Handle different URL types (mailto:, tel:, http/https, internal-anchor)
  const handleLinkPress = async (url: string) => {
    if (!url || !url.trim()) return;
    const trimmedUrl = url.trim();

    // Internal anchor (starts with "#")
    if (trimmedUrl.startsWith("#")) {
      const slug = trimmedUrl.slice(1); // e.g. "glossary-definitions"
      if (slug === "privacy-policy") {
        router.push({
          pathname: "/(pages)/Legal",
          params: { id: "privacy" },
        });
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        return;
      }
      const yPos = headingPositions[slug];
      if (yPos !== undefined && scrollRef.current) {
        scrollRef.current.scrollTo({ y: yPos, animated: true });
      }
      return;
    }

    try {
      // mailto:
      if (trimmedUrl.startsWith("mailto:")) {
        const email = trimmedUrl.replace("mailto:", "");
        const canOpen = await Linking.canOpenURL(`mailto:${email}`);
        if (canOpen) {
          await Linking.openURL(`mailto:${email}`);
        } else {
          Alert.alert("Contact Us", `Please send an email to:\n\n${email}`, [
            { text: "OK" },
          ]);
        }
        return;
      }

      // tel:
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

      // Regular http/https
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

  // Simple slugify function: lowercase, replace non-alphanum with hyphens
  const slugify = (raw: string) => {
    return raw
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Called on layout of each heading to record its y-offset
  const onHeadingLayout = (slug: string) => (event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    setHeadingPositions((prev) => ({ ...prev, [slug]: y }));
  };

  /**
   * Parses the full markdown content line-by-line.
   * Supports:
   *  - Horizontal dividers (lines that are exactly '---')
   *  - Headings # / ## / ### / #### (captures slug & position)
   *  - Unordered lists (- or *)
   *  - Ordered lists (1. 2. etc)
   *  - Paragraphs
   *
   * For each heading, we wrap with a View that has onLayout to capture y-offset,
   * so we can scroll to it when a link `#slug` is pressed.
   */
  const parseMarkdown = (markdown: string) => {
    if (!markdown) return null;

    const lines = markdown.split("\n");
    const elements: JSX.Element[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // 1) Horizontal divider '---'
      if (trimmed === "---") {
        elements.push(<View key={key++} style={styles.divider} />);
        continue;
      }

      // 2) Empty line → spacing
      if (!trimmed) {
        elements.push(<View key={key++} style={styles.spacing} />);
        continue;
      }

      // 3) Headings
      if (trimmed.startsWith("# ")) {
        // H1
        const rawText = trimmed.substring(2);
        const slug = slugify(rawText);
        elements.push(
          <View key={key++} onLayout={onHeadingLayout(slug)}>
            <Text style={styles.h1}>{parseInlineMarkdown(rawText)}</Text>
          </View>
        );
      } else if (trimmed.startsWith("## ")) {
        // H2
        const rawText = trimmed.substring(3);
        const slug = slugify(rawText);
        elements.push(
          <View key={key++} onLayout={onHeadingLayout(slug)}>
            <Text style={styles.h2}>{parseInlineMarkdown(rawText)}</Text>
          </View>
        );
      } else if (trimmed.startsWith("### ")) {
        // H3
        const rawText = trimmed.substring(4);
        const slug = slugify(rawText);
        elements.push(
          <View key={key++} onLayout={onHeadingLayout(slug)}>
            <Text style={styles.h3}>{parseInlineMarkdown(rawText)}</Text>
          </View>
        );
      } else if (trimmed.startsWith("#### ")) {
        // H4
        const rawText = trimmed.substring(5);
        const slug = slugify(rawText);
        elements.push(
          <View key={key++} onLayout={onHeadingLayout(slug)}>
            <Text style={styles.h4}>{parseInlineMarkdown(rawText)}</Text>
          </View>
        );
      }
      // 4) Unordered list items (- or *)
      else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const itemText = trimmed.substring(2);
        elements.push(
          <View key={key++} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{parseInlineMarkdown(itemText)}</Text>
          </View>
        );
      }
      // 5) Ordered (numbered) list items (1. 2. etc)
      else {
        const orderedMatch = /^(\d+)\.\s+(.*)/.exec(trimmed);
        if (orderedMatch) {
          const number = orderedMatch[1];
          const contentText = orderedMatch[2];
          elements.push(
            <View key={key++} style={styles.listItem}>
              <Text style={styles.bullet}>{number}.</Text>
              <Text style={styles.listText}>
                {parseInlineMarkdown(contentText)}
              </Text>
            </View>
          );
        }
        // 6) Regular paragraph
        else {
          elements.push(
            <Text key={key++} style={styles.paragraph}>
              {parseInlineMarkdown(line)}
            </Text>
          );
        }
      }
    }

    return elements;
  };

  /**
   * Parses inline markdown within a single line of text.
   * - Links: [text](url)
   * - Bold: **text**
   * - Italic: *text*
   * Returns an array of <Text> pieces accordingly.
   */
  const parseInlineMarkdown = (text: string): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    let key = 0;

    if (!text || typeof text !== "string") {
      return [<Text key={0}>{text || ""}</Text>];
    }

    // Combined regex for:
    //  (1) [link](url)
    //  (2) **bold**
    //  (3) *italic*
    // Note: We match bold (**…**) first, then italic (*…*), so bolds take precedence.
    const combinedRegex =
      /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    try {
      while ((match = combinedRegex.exec(text)) !== null) {
        // Text before this match
        if (match.index > lastIndex) {
          const beforeText = text.substring(lastIndex, match.index);
          if (beforeText) {
            elements.push(<Text key={key++}>{beforeText}</Text>);
          }
        }

        // (1) Link match: match[1] is full "[text](url)", match[2]=text, match[3]=url
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
        // (2) Bold match: match[4] is full "**text**", match[5] = bold content
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
        // (3) Italic match: match[6] is full "*text*", match[7] = italic content
        else if (match[6]) {
          const italicText = match[7];
          if (italicText) {
            elements.push(
              <Text key={key++} style={styles.italic}>
                {italicText}
              </Text>
            );
          }
        }

        lastIndex = match.index + match[0].length;
      }

      // Remaining text after last match
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
      ref={scrollRef}
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
    maxWidth: 800,
    alignSelf: "center",
    paddingHorizontal: 24,
    // paddingTop: 16,
  },
  h1: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    fontFamily: "Montserrat",
    textAlign: "center",
  },
  h2: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 24,
    fontFamily: "Montserrat",
    textAlign: "left",
  },
  h3: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    fontFamily: "Montserrat",
    textAlign: "left",
  },
  h4: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    fontFamily: "Montserrat",
    textAlign: "left",
  },
  paragraph: {
    textAlign: "left",
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 12,
    fontFamily: "Lato",
    lineHeight: 24,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 16,
  },
  bullet: {
    color: "#6B7280",
    marginRight: 8,
    fontFamily: "Lato",
    fontSize: 16,
    width: 24,
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
    color: "#3B82F6",
    textDecorationLine: "underline",
    fontFamily: "Lato",
  },
  bold: {
    color: "#0F0F0F",
    fontWeight: "bold",
    fontFamily: "Lato",
  },
  italic: {
    fontStyle: "italic",
    fontFamily: "Lato",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginVertical: 16,
  },
  spacing: {
    height: 8,
  },
});

export default Legal;
