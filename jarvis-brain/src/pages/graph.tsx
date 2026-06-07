import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface GraphNode {
  id: number;
  title: string;
  x: number;
  y: number;
  color: string | null;
  vx: number;
  vy: number;
}

interface GraphEdge {
  source: number;
  target: number;
  relation: string | null;
}

interface GraphData {
  nodes: Array<{ id: number; title: string; x: number; y: number; color: string | null }>;
  edges: Array<{ source: number; target: number; relation: string | null }>;
}

export default function GraphPage({ graph }: { graph?: GraphData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const animRef = useRef<number>(0);
  const hoveredNodeRef = useRef<number | null>(null);
  const dragRef = useRef<{ nodeId: number | null; offsetX: number; offsetY: number }>({
    nodeId: null, offsetX: 0, offsetY: 0,
  });

  useEffect(() => {
    if (!graph || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const nodes: GraphNode[] = graph.nodes.map((n) => ({
      ...n, x: n.x + width / 2, y: n.y + height / 2, vx: 0, vy: 0,
    }));
    nodesRef.current = nodes;
    edgesRef.current = graph.edges;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (dragRef.current.nodeId !== null) {
        const node = nodes.find((n) => n.id === dragRef.current.nodeId);
        if (node) { node.x = x + dragRef.current.offsetX; node.y = y + dragRef.current.offsetY; node.vx = 0; node.vy = 0; }
        return;
      }
      hoveredNodeRef.current = null;
      for (const node of nodes) {
        const dx = x - node.x; const dy = y - node.y;
        if (dx * dx + dy * dy < 400) { hoveredNodeRef.current = node.id; break; }
      }
      canvas.style.cursor = hoveredNodeRef.current !== null ? "pointer" : "default";
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left; const y = e.clientY - rect.top;
      for (const node of nodes) {
        const dx = x - node.x; const dy = y - node.y;
        if (dx * dx + dy * dy < 400) {
          dragRef.current = { nodeId: node.id, offsetX: node.x - x, offsetY: node.y - y };
          break;
        }
      }
    };

    const handleMouseUp = () => { dragRef.current.nodeId = null; };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);

    const step = () => {
      for (const node of nodes) {
        if (dragRef.current.nodeId === node.id) continue;
        node.vx *= 0.9; node.vy *= 0.9;
        const toCenterX = width / 2 - node.x; const toCenterY = height / 2 - node.y;
        const dist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY) + 1;
        node.vx += (toCenterX / dist) * 0.05; node.vy += (toCenterY / dist) * 0.05;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x; const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 1;
          const force = 500 / (dist * dist);
          const fx = (dx / dist) * force; const fy = (dy / dist) * force;
          if (dragRef.current.nodeId !== nodes[i].id) { nodes[i].vx -= fx; nodes[i].vy -= fy; }
          if (dragRef.current.nodeId !== nodes[j].id) { nodes[j].vx += fx; nodes[j].vy += fy; }
        }
      }
      for (const edge of edgesRef.current) {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);
        if (!source || !target) continue;
        const dx = target.x - source.x; const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        const force = (dist - 120) * 0.005;
        const fx = (dx / dist) * force; const fy = (dy / dist) * force;
        if (dragRef.current.nodeId !== source.id) { source.vx += fx; source.vy += fy; }
        if (dragRef.current.nodeId !== target.id) { target.vx -= fx; target.vy -= fy; }
      }
      for (const node of nodes) {
        if (dragRef.current.nodeId === node.id) continue;
        node.x += node.vx; node.y += node.vy;
        node.x = Math.max(20, Math.min(width - 20, node.x));
        node.y = Math.max(20, Math.min(height - 20, node.y));
      }
      ctx.clearRect(0, 0, width, height);
      for (const edge of edgesRef.current) {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);
        if (!source || !target) continue;
        ctx.beginPath(); ctx.moveTo(source.x, source.y); ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1; ctx.stroke();
      }
      for (const node of nodes) {
        const isHovered = hoveredNodeRef.current === node.id;
        ctx.beginPath(); ctx.arc(node.x, node.y, isHovered ? 12 : 8, 0, Math.PI * 2);
        ctx.fillStyle = node.color || "#6366f1"; ctx.fill();
        ctx.strokeStyle = isHovered ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)";
        ctx.lineWidth = isHovered ? 2 : 1; ctx.stroke();
        if (isHovered) {
          ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = "12px sans-serif";
          ctx.textAlign = "center"; ctx.fillText(node.title, node.x, node.y - 20);
        }
      }
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [graph]);

  return (
    <div className="p-8 h-[calc(100vh-2rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Knowledge Graph</h1>
        <p className="text-muted-foreground mt-1">
          {graph?.nodes.length ?? 0} nodes, {graph?.edges.length ?? 0} connections
        </p>
      </div>
      <Card className="h-[calc(100%-80px)] bg-card border-card-border overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </Card>
    </div>
  );
}
