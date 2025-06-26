import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const width = searchParams.get("width") || "300"
  const height = searchParams.get("height") || "300"
  const text = searchParams.get("text") || "Product Image"

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        fontSize: 40,
        color: "white",
        background: "#8D6E63",
        width: "100%",
        height: "100%",
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {text}
    </div>,
    {
      width: Number(width),
      height: Number(height),
    },
  )
}
