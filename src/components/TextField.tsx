import { TextInput, type TextInputProps } from "react-native"

interface TextFieldProps extends TextInputProps {
  className?: string
  variant?: "default" | "dark"
}

export default function TextField({ className = "", variant = "default", ...props }: TextFieldProps) {
  const baseStyles = "rounded-xl p-4 text-base"

  const variantStyles = {
    default: "border border-gray-300 dark:border-gray-600 text-black dark:text-white bg-white dark:bg-gray-800 mb-4",
    dark: "bg-gray-800 text-white border border-gray-600 mb-0",
  }

  return (
    <TextInput
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      placeholderTextColor={variant === "dark" ? "#9CA3AF" : "#888"}
      {...props}
    />
  )
}
