import React, { useRef, useState } from "react";
import { Stage, Layer, Line, Rect, Circle } from "react-konva";
import { Button, Stack } from "@mui/material";

export default function MapEditor() {
  const [tool, setTool] = useState("pen"); // pen | eraser | rect | circle
  const [color, setColor] = useState("black");
  const [lines, setLines] = useState([]);
  const [shapes, setShapes] = useState([]);
  const isDrawing = useRef(false);

  const handleMouseDown = (e) => {
    isDrawing.current = true;

    const pos = e.target.getStage().getPointerPosition();

    if (tool === "pen" || tool === "eraser") {
      setLines([
        ...lines,
        {
          tool,
          color: tool === "eraser" ? "white" : color,
          points: [pos.x, pos.y],
        },
      ]);
    }

    if (tool === "rect") {
      setShapes([
        ...shapes,
        {
          type: "rect",
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          stroke: color,
        },
      ]);
    }

    if (tool === "circle") {
      setShapes([
        ...shapes,
        {
          type: "circle",
          x: pos.x,
          y: pos.y,
          radius: 0,
          stroke: color,
        },
      ]);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    if (tool === "pen" || tool === "eraser") {
      let lastLine = lines[lines.length - 1];
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      lines.splice(lines.length - 1, 1, lastLine);
      setLines([...lines]);
    }

    if (tool === "rect") {
      let lastShape = shapes[shapes.length - 1];
      lastShape.width = point.x - lastShape.x;
      lastShape.height = point.y - lastShape.y;
      shapes.splice(shapes.length - 1, 1, lastShape);
      setShapes([...shapes]);
    }

    if (tool === "circle") {
      let lastShape = shapes[shapes.length - 1];
      const dx = point.x - lastShape.x;
      const dy = point.y - lastShape.y;
      lastShape.radius = Math.sqrt(dx * dx + dy * dy);
      shapes.splice(shapes.length - 1, 1, lastShape);
      setShapes([...shapes]);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleClear = () => {
    setLines([]);
    setShapes([]);
  };

  return (
    <div style={{ padding: "10px" }}>
      {/* Toolbar */}
      <Stack direction="row" spacing={1} mb={2}>
        <Button variant={tool === "pen" ? "contained" : "outlined"} onClick={() => setTool("pen")}>
          Pen
        </Button>

        <Button variant={tool === "eraser" ? "contained" : "outlined"} onClick={() => setTool("eraser")}>
          Eraser
        </Button>

        <Button variant={tool === "rect" ? "contained" : "outlined"} onClick={() => setTool("rect")}>
          Rectangle
        </Button>

        <Button variant={tool === "circle" ? "contained" : "outlined"} onClick={() => setTool("circle")}>
          Circle
        </Button>

        {/* Color Selector */}
        <Button style={{ background: "black", color: "white" }} onClick={() => setColor("black")}>Black</Button>
        <Button style={{ background: "red", color: "white" }} onClick={() => setColor("red")}>Red</Button>
        <Button style={{ background: "blue", color: "white" }} onClick={() => setColor("blue")}>Blue</Button>
        <Button style={{ background: "green", color: "white" }} onClick={() => setColor("green")}>Green</Button>

        <Button variant="outlined" onClick={handleClear}>Clear</Button>
      </Stack>

      {/* Canvas */}
      <Stage
        width={800}
        height={500}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        style={{ border: "1px solid #ccc" }}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={tool === "eraser" ? 15 : 3}
              lineCap="round"
              lineJoin="round"
            />
          ))}

          {shapes.map((shape, i) =>
            shape.type === "rect" ? (
              <Rect
                key={i}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                stroke={shape.stroke}
                strokeWidth={2}
              />
            ) : (
              <Circle
                key={i}
                x={shape.x}
                y={shape.y}
                radius={shape.radius}
                stroke={shape.stroke}
                strokeWidth={2}
              />
            )
          )}
        </Layer>
      </Stage>
    </div>
  );
}
