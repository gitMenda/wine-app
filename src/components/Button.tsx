import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";

type Variant = "primary" | "secondary" | "danger";

type Props = TouchableOpacityProps & {
  title: string;
  variant?: Variant;
};

const variantStyles: Record<Variant, { button: string; text: string }> = {
  primary: {
    button: "bg-burgundy-600 dark:bg-burgundy-600",
    text: "text-white",
  },
  secondary: {
    button: "bg-burgundy-100 dark:bg-burgundy-950",
    text: "text-burgundy-600 dark:text-burgundy-500",
  },
  danger: {
    button: "bg-red-100 dark:bg-red-950",
    text: "text-red-600 dark:text-red-500",
  },
};

export default function Button({
  title,
  variant = "primary",
  className = "",
  ...rest
}: Props) {
  const { button, text } = variantStyles[variant];

  return (
    <TouchableOpacity
      className={`rounded-lg px-6 p-4 ${button} ${className}`}
      {...rest}
    >
      <Text className={`text-center font-semibold text-base ${text}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
