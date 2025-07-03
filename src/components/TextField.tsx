import { TextInput, type TextInputProps, View, Text } from "react-native"

interface TextFieldProps extends TextInputProps {
  className?: string
  variant?: "default" | "dark"
  error?: boolean
  errorMessage?: string
}

export default function TextField({
  className = "",
  variant = "default",
  error = false,
  errorMessage,
  ...props
}: TextFieldProps) {
  const baseStyles = "rounded-2xl p-4 text-base"

  const variantStyles = {
    default: `border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"} text-black dark:text-white bg-white dark:bg-gray-800 mb-1`,
    dark: `${error ? "bg-gray-800 border-red-500" : "bg-gray-8 00 border-gray-600"} text-white border mb-1`,
  }

  return (
    <View className="mb-3">
      <TextInput
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        placeholderTextColor={variant === "dark" ? "#9CA3AF" : "#888"}
        {...props}
      />
      {error && errorMessage && <Text className="text-red-500 text-xs mt-1 ml-1">{errorMessage}</Text>}
    </View>
  )
}
