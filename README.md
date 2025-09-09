# Human Body Puzzle - Educational Game

A complete, production-quality React educational game that teaches human anatomy through interactive drag-and-drop gameplay.

## 🎮 Game Features

- **Drag & Drop Mechanics**: Custom pointer-based drag-and-drop that works perfectly on both touch and mouse devices
- **SVG Coordinate System**: Precise placement detection using SVG coordinates with snapping tolerance
- **Scoring System**: +10 points for correct placement, -2 for incorrect attempts
- **Timer**: 2-minute countdown with time bonus for early completion
- **Audio Feedback**: Success and error sounds with toggle controls
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Accessibility**: Keyboard navigation and ARIA labels for screen readers

## 🏗️ Technology Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** with custom design system
- **Custom pointer events** for drag-and-drop (no external libraries)
- **SVG-based coordinate system** for precise organ placement

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ or Bun
- Package manager (npm, yarn, or bun)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. Open your browser to `http://localhost:5173`

## 🎯 How to Play

1. **Objective**: Drag organs from the bottom tray to their correct positions on the human body
2. **Scoring**: 
   - +10 points for correct placement
   - -2 points for incorrect attempts
   - Time bonus for completing before the 2-minute timer expires
3. **Visual Feedback**: 
   - Target regions pulse when dragging an organ
   - Successful placements trigger animations and sounds
   - Wrong placements cause shake animations
4. **Win Condition**: Place all organs correctly before time runs out

## 🔧 Customization

### Adjusting Target Coordinates

Edit the `TARGETS` array in `src/pages/Index.tsx` to modify organ placement positions:

```typescript
const TARGETS: Target[] = [
  { id: 'brain', x: 200, y: 60, r: 46 },    // x, y in SVG coordinates, r = snap radius
  { id: 'heart', x: 200, y: 280, r: 36 },
  // Add more targets...
];
```

### Changing Snap Sensitivity

Modify the `SNAP_FACTOR` constant in `src/pages/Index.tsx`:
```typescript
const SNAP_FACTOR = 1.2; // Increase for more forgiving snapping
```

### Adding New Organs

1. Add the organ image to `src/assets/`
2. Import it in `src/pages/Index.tsx`
3. Add entries to both `TARGETS` and `ORGANS` arrays
4. Update the target coordinates in the SVG viewBox (0 0 400 700)

### Customizing Appearance

The game uses a semantic design system defined in:
- `src/index.css` - Color variables and gradients
- `tailwind.config.ts` - Tailwind extensions and animations

## 📁 Project Structure

```
src/
├── components/
│   ├── GameBoard.tsx      # SVG body outline and placed organs
│   ├── OrganTray.tsx      # Bottom tray with draggable organs
│   ├── OrganPiece.tsx     # Individual draggable organ component
│   ├── ScoreBoard.tsx     # Score, timer, and controls
│   └── EndScreen.tsx      # Win/lose overlay
├── utils/
│   └── snapUtils.ts       # Coordinate conversion utilities
├── assets/                # Organ images
└── pages/
    └── Index.tsx         # Main game logic and state management
```

## 🎨 Design System

The game uses a custom design system with:
- **Semantic color tokens** for consistent theming
- **Custom gradients** for visual appeal
- **Smooth animations** for enhanced user experience
- **Responsive breakpoints** for all device sizes
- **Game-specific shadows** and effects

## 🧪 Testing Checklist

- [ ] Drag each organ to its correct body region - should snap and stay placed
- [ ] Drag an organ to wrong region - should shake and return to tray, score -2
- [ ] Place all organs - congratulations overlay should appear with final score
- [ ] Let timer expire - "Time's Up!" overlay should appear
- [ ] Toggle sound and music - audio should mute/unmute
- [ ] Test on mobile - touch drag & drop should work smoothly
- [ ] Test keyboard navigation - Tab and Enter should work for accessibility

## 🔊 Audio System

The game includes a lightweight audio system using Web Audio API:
- **Success sounds** for correct placements
- **Error sounds** for wrong attempts
- **Sound toggle** for user preference
- **Music toggle** for background audio (placeholder)

## 📱 Mobile Optimization

- **Touch-friendly** drag and drop using pointer events
- **Responsive layout** with mobile-specific organ tray positioning
- **Optimized performance** with GPU-accelerated transforms
- **Accessible touch targets** with proper sizing

## 🌟 Educational Value

- **Anatomically accurate** organ positions
- **Visual learning** through interactive placement
- **Immediate feedback** for reinforcement learning
- **Progress tracking** to motivate completion
- **Gamification** elements to maintain engagement

## 🔍 Browser Support

- Chrome 91+
- Firefox 90+
- Safari 14+
- Edge 91+
- Mobile browsers with pointer event support

## 📄 License

This project is for educational purposes. Feel free to modify and use for learning anatomy!