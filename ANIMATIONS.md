# Loading Animations Guide

This document describes all the loading animations and transitions added to the Airbnb Sentiment Analysis application.

## Loading Spinner Component

### Visual Elements

1. **Spinning Circle**
   - 60px diameter circular spinner
   - Purple gradient border (`#667eea`)
   - Smooth 1-second rotation animation
   - Semi-transparent background ring

2. **Icon (Optional)**
   - Centered inside spinner
   - Home icon for dashboard loading
   - Pulsing animation synchronized with text
   - Purple color matching theme

3. **Loading Text**
   - Dynamic message display
   - Pulsing opacity animation (2-second cycle)
   - Gray color (`#6b7280`)
   - Medium font weight

4. **Countdown Timer (Optional)**
   - Large number display (3rem font)
   - Counts down from 5 seconds
   - Pulsing scale animation (1-second cycle)
   - Purple color with text shadow
   - "seconds remaining..." label

5. **Animated Dots**
   - Three bouncing dots
   - Staggered animation (0.2s delay between each)
   - Purple color matching app theme
   - Scale and opacity transitions

## Animation Types

### 1. Spin Animation
```css
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```
- **Used for**: Loading spinner circle
- **Duration**: 1 second
- **Timing**: Linear, infinite loop

### 2. Pulse Animation
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```
- **Used for**: Loading text
- **Duration**: 2 seconds
- **Timing**: Ease-in-out, infinite loop

### 3. Bounce Animation
```css
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
```
- **Used for**: Loading dots
- **Duration**: 1.4 seconds
- **Timing**: Ease-in-out, infinite loop
- **Stagger**: 0.2s delay between dots

### 4. Fade-In Animation
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```
- **Used for**: Content transitions
- **Duration**: 0.4-0.5 seconds
- **Timing**: Ease-out, plays once

### 5. Countdown Pulse Animation
```css
@keyframes countdownPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}
```
- **Used for**: Countdown number
- **Duration**: 1 second
- **Timing**: Ease-in-out, infinite loop
- **Effect**: Number grows and shrinks with each second

## Loading States

### Dashboard Loading
```javascript
<LoadingSpinner message="Analyzing sentiment data..." />
```
- Displays while fetching statistics and trends
- Shows spinning circle with custom message

### Reviews Loading
```javascript
<LoadingSpinner message="Loading reviews..." />
```
- Displays while fetching paginated reviews
- Updates on filter/search changes

### Initial Load with Countdown
```javascript
<LoadingSpinner 
  message="Loading dashboard..." 
  icon={<Home size={32} />} 
  showCountdown={true} 
/>
```
- Shows on first app load
- Displays home icon in center of spinner
- Shows 5-second countdown timer
- Transitions to dashboard when data is ready

## Content Transitions

### Staggered Stat Cards
Each stat card appears with a delay:
- Card 1: 0.1s delay
- Card 2: 0.2s delay
- Card 3: 0.3s delay
- Card 4: 0.4s delay

Creates a cascading effect when the dashboard loads.

### Section Transitions
All major sections fade in smoothly:
- Dashboard section
- Reviews section
- Analyzer section
- Individual review cards
- Analysis results

### Interactive Elements
Enhanced hover effects on:
- **Analyze button**: Lifts up with shadow on hover
- **Stat cards**: Lift and shadow on hover
- **Review cards**: Subtle lift on hover
- **Navigation buttons**: Background color transition

## Usage Examples

### Custom Loading Messages

The `LoadingSpinner` component accepts multiple props:

```javascript
// Default message
<LoadingSpinner />

// Custom message
<LoadingSpinner message="Processing your request..." />

// With icon
<LoadingSpinner 
  message="Loading..." 
  icon={<Home size={32} />} 
/>

// With countdown
<LoadingSpinner 
  message="Please wait..." 
  showCountdown={true} 
/>

// Full featured
<LoadingSpinner 
  message="Loading dashboard..." 
  icon={<Home size={32} />} 
  showCountdown={true} 
/>

// Different contexts
<LoadingSpinner message="Analyzing sentiment data..." />
<LoadingSpinner message="Loading reviews..." />
<LoadingSpinner message="Searching..." />
```

### Customizing Countdown Duration

To change the countdown duration, modify the initial state in `App.js`:

```javascript
const [countdown, setCountdown] = React.useState(10); // 10 seconds instead of 5
```

### Adding Fade-In to New Components

To add fade-in animation to any element:

```css
.your-element {
  animation: fadeIn 0.5s ease-out;
}
```

With delay:
```css
.your-element {
  animation: fadeIn 0.5s ease-out;
  animation-delay: 0.3s;
}
```

## Performance Considerations

1. **Hardware Acceleration**
   - Animations use `transform` and `opacity`
   - GPU-accelerated for smooth performance
   - No layout thrashing

2. **Animation Duration**
   - Short durations (0.4-0.5s) for snappy feel
   - Longer durations (1-2s) for ambient animations
   - Infinite loops for loading states only

3. **Reduced Motion**
   - Consider adding media query for accessibility:
   ```css
   @media (prefers-reduced-motion: reduce) {
     * {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
     }
   }
   ```

## Color Scheme

All animations use the app's color palette:
- **Primary Purple**: `#667eea`
- **Hover Purple**: `#5568d3`
- **Text Gray**: `#6b7280`
- **Success Green**: `#10b981`
- **Error Red**: `#ef4444`

## Browser Compatibility

All animations are compatible with:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

Uses standard CSS animations with vendor prefixes where needed.

## Future Enhancements

Potential animation improvements:
1. Skeleton screens for content loading
2. Progress bars for long operations
3. Micro-interactions on data updates
4. Confetti or celebration animations for positive sentiment
5. Smooth chart transitions when data updates
6. Page transition animations
7. Scroll-triggered animations for long lists

## Customization

To adjust animation speed globally, modify the duration values:

```css
/* Faster animations */
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Slower animations */
.fade-in {
  animation: fadeIn 0.8s ease-out;
}
```

To change the loading spinner color:
```css
.loading-spinner {
  border-top-color: #your-color;
}

.loading-dot {
  background: #your-color;
}
```
