import React from "react"
import { useNavigation } from "@remix-run/react"
import { Button, ButtonProps } from "./button"

const SubmitButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const navigation = useNavigation()
    const isSubmitting = navigation.state === "submitting"

    return <Button disabled={isSubmitting} ref={ref} {...props} />
  }
)

SubmitButton.displayName = "SubmitButton"

export { SubmitButton }
