type RevealProps = React.ComponentProps<"div"> & {
  /** Kept for call-site compatibility; content is static and visible by default. */
  delay?: number
  y?: number
}

/**
 * Plain block wrapper. Motion on this page is reserved for authored moments
 * (hero load, header rail, plate roll, balance bar, scheda stamps), so
 * section content renders visible with no generic entrance.
 */
export function Reveal(props: RevealProps) {
  const { delay, y, ...rest } = props
  void delay
  void y
  return <div {...rest} />
}
