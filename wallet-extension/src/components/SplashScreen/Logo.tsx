import * as React from "react"
import {
  chakra,
  keyframes,
  ImageProps,
  forwardRef,
  usePrefersReducedMotion,
} from "@chakra-ui/react"
import logo from "../../assets/logo.webp"

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

export const Logo = forwardRef<ImageProps, "img">((props, ref) => {
  const prefersReducedMotion = usePrefersReducedMotion()

  const animation = prefersReducedMotion
    ? undefined
    : `${spin} forwards 1s linear`;


  const imageStyles = {
    transform: "scale(0.1)" // Scale the image down to 80% of its original size
  };

  return <chakra.img

    animation={animation} src={logo} ref={ref} {...props} style={imageStyles} />
})
