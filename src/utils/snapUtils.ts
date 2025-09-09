/**
 * Utility functions for coordinate conversion and snap detection
 * Handles conversion between client coordinates and SVG coordinate space
 */

export interface Target {
  x: number;
  y: number;
  r: number;
  id: string;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Convert client coordinates to SVG coordinates
 * @param clientX - Client X coordinate from pointer event
 * @param clientY - Client Y coordinate from pointer event
 * @param svgElement - The SVG element
 * @param viewBoxWidth - SVG viewBox width (400)
 * @param viewBoxHeight - SVG viewBox height (700)
 */
export function clientToSVGCoords(
  clientX: number,
  clientY: number,
  svgElement: SVGSVGElement,
  viewBoxWidth: number = 400,
  viewBoxHeight: number = 700
): Point {
  const rect = svgElement.getBoundingClientRect();
  
  const svgX = ((clientX - rect.left) / rect.width) * viewBoxWidth;
  const svgY = ((clientY - rect.top) / rect.height) * viewBoxHeight;
  
  return { x: svgX, y: svgY };
}

/**
 * Calculate Euclidean distance between two points
 */
export function calculateDistance(point1: Point, point2: Point): number {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a point is within snapping distance of a target
 * @param point - The point to check
 * @param target - The target with x, y, and radius
 * @param snapFactor - Multiplier for snap radius (default 1.2)
 */
export function isWithinSnapDistance(
  point: Point,
  target: Target,
  snapFactor: number = 1.2
): boolean {
  const distance = calculateDistance(point, { x: target.x, y: target.y });
  return distance <= target.r * snapFactor;
}

/**
 * Convert SVG coordinates back to client coordinates for positioning elements
 */
export function svgToClientCoords(
  svgX: number,
  svgY: number,
  svgElement: SVGSVGElement,
  viewBoxWidth: number = 400,
  viewBoxHeight: number = 700
): Point {
  const rect = svgElement.getBoundingClientRect();
  
  const clientX = (svgX / viewBoxWidth) * rect.width + rect.left;
  const clientY = (svgY / viewBoxHeight) * rect.height + rect.top;
  
  return { x: clientX, y: clientY };
}