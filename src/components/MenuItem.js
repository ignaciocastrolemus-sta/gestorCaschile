import React from "react";
import { Pressable, Text, View } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";

export default function MenuItem({ label, active, onPress, icon, highlight = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        dash.item,
        active && dash.itemActive,
        highlight && active && dash.itemHighlightActive,
      ]}
    >
      <View style={dash.itemInner}>
        <View
          style={[
            dash.itemIconWrap,
            active && dash.itemIconWrapActive,
            highlight && active && dash.itemIconWrapHighlight,
          ]}
        >
          <Text
            style={[
              dash.itemIcon,
              active && dash.itemIconActive,
              highlight && active && dash.itemIconHighlight,
            ]}
          >
            {icon || "•"}
          </Text>
        </View>
        <Text
          style={[
            dash.itemText,
            active && { color: COLORS.blue2 },
            highlight && active && dash.itemTextHighlight,
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            dash.itemArrow,
            active && dash.itemArrowActive,
            highlight && active && dash.itemArrowHighlight,
          ]}
        >
          ›
        </Text>
      </View>
    </Pressable>
  );
}
