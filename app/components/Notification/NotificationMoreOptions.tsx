import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { NotificationItem } from "@/app/types";
import useNotification from "./useNotification";
import MarkasRead from "@/assets/icons/Notification/MarkAsReadInDark.svg";
import MarkAsUnread from "@/assets/icons/Notification/markAsUnread.svg";
import Archieve from "@/assets/icons/Notification/Archieve.svg";

interface NotificationMoreOptionsProps {
  notification: NotificationItem;
}

const NotificationMoreOptions: React.FC<NotificationMoreOptionsProps> = ({
  notification,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<View>(null);
  const { archiveNotification, markAsRead, markAsUnRead } = useNotification();

  const isRead = notification.isRead;

  const handleMorePress = () => {
    buttonRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      setMenuPosition({ x: pageX, y: pageY + height });
      setModalVisible(true);
    });
  };

  return (
    <>
      <TouchableOpacity ref={buttonRef} onPress={handleMorePress}>
        <MaterialIcons name="more-horiz" size={20} color="#6B7280" />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={[styles.menuCard, { position: 'absolute', top: menuPosition.y, left: menuPosition.x - 140 }]}>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setModalVisible(false);
                isRead
                  ? markAsUnRead(notification.notificationId)
                  : markAsRead(notification.notificationId);
              }}
            >
              {isRead ? (
                <MarkAsUnread
                  width={20}
                  height={20}
                  style={{ marginRight: 10 }}
                />
              ) : (
                <MarkasRead
                  width={20}
                  height={20}
                  style={{ marginRight: 10 }}
                />
              )}
              <Text style={[styles.menuOptionText]}>
                {isRead ? "Mark as unread" : "Mark as read"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setModalVisible(false);
                archiveNotification(notification.notificationId);
              }}
            >
              <Archieve
                width={20}
                height={20}
                style={{ marginRight: 10 }}
                stroke="#0D0D0D"
                strokeWidth={0.3}
              />
              <Text style={styles.menuOptionText}>Archive</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 0,
    minWidth: 180,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  menuOptionText: {
    fontSize: 16,
    color: "#222",
  },
});

export default NotificationMoreOptions;
