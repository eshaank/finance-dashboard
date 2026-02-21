declare module 'react-simple-maps' {
  import type { ComponentType, ReactNode, SVGProps, MouseEvent } from 'react'

  export interface GeoPermissibleObjects {
    type: string
  }

  export interface RSMGeo {
    rsmKey: string
    id: string
    properties: Record<string, unknown>
    [key: string]: unknown
  }

  export interface ComposableMapProps {
    projection?: string
    projectionConfig?: Record<string, unknown>
    width?: number
    height?: number
    style?: React.CSSProperties
    className?: string
    children?: ReactNode
  }
  export const ComposableMap: ComponentType<ComposableMapProps>

  export interface ZoomableGroupProps {
    zoom?: number
    minZoom?: number
    maxZoom?: number
    center?: [number, number]
    children?: ReactNode
  }
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>

  export interface GeographiesProps {
    geography: string | GeoPermissibleObjects
    children: (props: { geographies: RSMGeo[] }) => ReactNode
  }
  export const Geographies: ComponentType<GeographiesProps>

  export interface GeographyStyle {
    fill?: string
    stroke?: string
    strokeWidth?: number
    outline?: string
    cursor?: string
  }

  export interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: RSMGeo
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: {
      default?: GeographyStyle
      hover?: GeographyStyle
      pressed?: GeographyStyle
    }
    onMouseEnter?: (evt: MouseEvent<SVGPathElement>) => void
    onMouseLeave?: (evt: MouseEvent<SVGPathElement>) => void
    onClick?: (evt: MouseEvent<SVGPathElement>) => void
  }
  export const Geography: ComponentType<GeographyProps>
}
